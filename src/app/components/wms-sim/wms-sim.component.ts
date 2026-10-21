import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';

interface Product {
  key: string;
  icon: string;
}

interface Bin {
  id: string;        // location code, e.g. A-02-1 (aisle-bay-level)
  product: Product;
  remaining: number; // units still to pick, shown on the PTL display
  lit: boolean;
  done: boolean;
  error: boolean;
}

interface OrderLine {
  bin: Bin;
  qty: number;
  picked: number;
}

interface Route {
  code: string;
  name: string;
  lane: number;
}

interface LogEntry {
  time: string;
  text: string;
  level: 'info' | 'ok' | 'warn';
}

type Phase = 'idle' | 'picking' | 'sorting' | 'done';

const PRODUCTS: Product[] = [
  { key: 'keyboard', icon: '⌨️' },
  { key: 'coffee', icon: '☕' },
  { key: 'duck', icon: '🦆' },
  { key: 'monitor', icon: '🖥️' },
  { key: 'headphones', icon: '🎧' },
  { key: 'mug', icon: '🍵' },
  { key: 'stickers', icon: '🏷️' },
  { key: 'cable', icon: '🔌' },
  { key: 'plant', icon: '🪴' },
  { key: 'notebook', icon: '📓' },
  { key: 'mouse', icon: '🖱️' },
  { key: 'pizza', icon: '🍕' }
];

// Vertical position (%) of each sorter lane in the conveyor drawing
const LANE_Y = [18, 50, 82];

const ROUTES: Route[] = [
  { code: 'CABA', name: 'Buenos Aires', lane: 0 },
  { code: 'COR', name: 'Córdoba', lane: 1 },
  { code: 'ROS', name: 'Rosario', lane: 2 }
];

@Component({
  selector: 'app-wms-sim',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RevealDirective],
  templateUrl: './wms-sim.component.html',
  styleUrl: './wms-sim.component.css'
})
export class WmsSimComponent implements OnDestroy {
  readonly routes = ROUTES;
  readonly laneY = LANE_Y;
  readonly levels = [3, 2, 1];
  readonly bays = [1, 2, 3, 4];

  phase: Phase = 'idle';
  bins: Bin[] = this.createBins();
  lines: OrderLine[] = [];
  orderId = '';
  route: Route = ROUTES[0];
  log: LogEntry[] = [];

  elapsed = 0;
  units = 0;
  errors = 0;
  wrongBinFlash = false;
  scanning = false;

  // Carton position on the conveyor, in % of the conveyor area
  box = { x: 4, y: 50, duration: 0 };
  boxVisible = false;

  shipTo = '';

  private startTime = 0;
  private timerId?: ReturnType<typeof setInterval>;
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  constructor(private translate: TranslateService) {}

  ngOnDestroy(): void {
    this.clearTimers();
  }

  get totalUnits(): number {
    return this.lines.reduce((sum, line) => sum + line.qty, 0);
  }

  get accuracy(): number {
    const attempts = this.units + this.errors;
    return attempts === 0 ? 100 : Math.round((this.units / attempts) * 100);
  }

  get resultKey(): string {
    if (this.elapsed < 12 && this.errors === 0) return 'wms.result.fast';
    if (this.elapsed < 25 && this.errors <= 2) return 'wms.result.ok';
    return 'wms.result.slow';
  }

  get recipient(): string {
    return (this.shipTo.trim() || this.translate.instant('wms.defaultName')).slice(0, 24);
  }

  get zpl(): string {
    return [
      '^XA',
      '^CF0,32',
      `^FO40,40^FDLUNA CASAVOLA WMS^FS`,
      `^FO40,90^FDSHIP TO: ${this.recipient.toUpperCase()}^FS`,
      `^FO40,140^FDORDER: ${this.orderId}  UNITS: ${this.totalUnits}^FS`,
      '^CF0,90',
      `^FO40,200^FD${this.route.code}^FS`,
      `^BY3^FO40,320^BCN,110,Y,N,N^FD${this.orderId}^FS`,
      '^XZ'
    ].join('\n');
  }

  /** Bar widths for a decorative barcode derived from the order id (bar, space, bar, space...) */
  get barcode(): number[] {
    const guard = [2, 1, 1, 2];
    const body = this.orderId.split('').flatMap(ch => {
      const d = ch.charCodeAt(0);
      return [(d % 3) + 1, ((d + 1) % 2) + 1, ((d * 7) % 3) + 1, (d % 2) + 1];
    });
    return [...guard, ...body, ...guard, 2];
  }

  binAt(level: number, bay: number): Bin {
    return this.bins.find(b => b.id === `A-0${bay}-${level}`)!;
  }

  startOrder(): void {
    this.clearTimers();
    this.bins = this.createBins();
    this.log = [];
    this.units = 0;
    this.errors = 0;
    this.elapsed = 0;
    this.boxVisible = false;
    this.box = { x: 4, y: 50, duration: 0 };

    this.orderId = String(10000 + Math.floor(Math.random() * 90000));
    this.route = ROUTES[Math.floor(Math.random() * ROUTES.length)];

    // 3 different bins, 1-3 units each
    const shuffled = [...this.bins].sort(() => Math.random() - 0.5);
    this.lines = shuffled.slice(0, 3).map(bin => {
      const qty = 1 + Math.floor(Math.random() * 3);
      bin.remaining = qty;
      bin.lit = true;
      return { bin, qty, picked: 0 };
    });

    this.phase = 'picking';
    this.addLog(`ORDER ${this.orderId} RELEASED → ROUTE ${this.route.code}`);
    this.lines.forEach(line => this.addLog(`PTL ${line.bin.id} ON qty=${line.qty}`));

    this.startTime = performance.now();
    this.timerId = setInterval(() => {
      this.elapsed = (performance.now() - this.startTime) / 1000;
    }, 100);
  }

  pick(bin: Bin): void {
    if (this.phase !== 'picking') return;

    const line = this.lines.find(l => l.bin === bin);
    if (!line || bin.remaining === 0) {
      this.errors++;
      this.flashError(bin);
      this.addLog(`WRONG BIN ${bin.id}`, 'warn');
      return;
    }

    bin.remaining--;
    line.picked++;
    this.units++;

    if (bin.remaining === 0) {
      bin.lit = false;
      bin.done = true;
      this.addLog(`PICK ${bin.id} CONFIRMED (${line.qty}/${line.qty})`, 'ok');
    }

    if (this.lines.every(l => l.picked === l.qty)) {
      this.closeCarton();
    }
  }

  private closeCarton(): void {
    clearInterval(this.timerId);
    this.elapsed = (performance.now() - this.startTime) / 1000;
    this.phase = 'sorting';
    this.addLog(`CARTON CLOSED · ${this.totalUnits} units · ${this.elapsed.toFixed(1)}s`, 'ok');

    const laneY = LANE_Y[this.route.lane];
    this.boxVisible = true;

    // Conveyor sequence: run to the sorter, scan, divert to the route lane, exit
    this.schedule(60, () => (this.box = { x: 50, y: 50, duration: 1600 }));
    this.schedule(950, () => {
      this.scanning = true;
      this.addLog(`SCAN ${this.orderId} → ${this.route.code}`);
    });
    this.schedule(1300, () => (this.scanning = false));
    this.schedule(1700, () => {
      this.box = { x: 64, y: laneY, duration: 500 };
      this.addLog(`SORTER DIVERT → LANE ${this.route.lane + 1}`);
    });
    this.schedule(2250, () => (this.box = { x: 92, y: laneY, duration: 800 }));
    this.schedule(3100, () => {
      this.phase = 'done';
      this.addLog('LABEL PRINTED (ZPL) · SHIPPED', 'ok');
    });
  }

  private flashError(bin: Bin): void {
    bin.error = true;
    this.wrongBinFlash = true;
    this.schedule(450, () => (bin.error = false));
    this.schedule(900, () => (this.wrongBinFlash = false));
  }

  private addLog(text: string, level: LogEntry['level'] = 'info'): void {
    const time = new Date().toLocaleTimeString('en-GB');
    this.log = [{ time, text, level }, ...this.log].slice(0, 30);
  }

  private schedule(ms: number, fn: () => void): void {
    this.timeouts.push(setTimeout(fn, ms));
  }

  private clearTimers(): void {
    clearInterval(this.timerId);
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }

  private createBins(): Bin[] {
    const bins: Bin[] = [];
    let i = 0;
    for (const level of [3, 2, 1]) {
      for (const bay of [1, 2, 3, 4]) {
        bins.push({
          id: `A-0${bay}-${level}`,
          product: PRODUCTS[i++],
          remaining: 0,
          lit: false,
          done: false,
          error: false
        });
      }
    }
    return bins;
  }
}
