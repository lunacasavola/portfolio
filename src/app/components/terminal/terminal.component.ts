import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TerminalService } from '../../services/terminal.service';
import { EffectsService } from '../../services/effects.service';
import { ColorThemeService } from '../../services/color-theme.service';
import { SKILL_GROUPS } from '../skills/skills.component';
import { PROJECTS } from '../projects/projects.component';
import { EXPERIENCE } from '../experience/experience.component';

interface Line {
  text: string;
  cls?: string;
  label?: string;   // left column (used by help / key-value output)
  href?: string;
}

const PROMPT = 'luna@portfolio:~$';

// Section ids on the page, and the "directories" shown by `ls`
const SECTIONS = ['home', 'summary', 'projects', 'wms', 'skills', 'experience', 'info', 'contact'];

const THEMES: Record<string, string> = {
  matrix: '#00ff41',
  cyan: '#00e5ff',
  purple: '#b388ff',
  amber: '#ffb300',
  pink: '#ff2d95',
  red: '#ff5252'
};

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const BANNER = String.raw`
 _
| |   _   _ _ __   __ _
| |  | | | | '_ \ / _' |
| |__| |_| | | | | (_| |
|_____\__,_|_| |_|\__,_|`;

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './terminal.component.html'
})
export class TerminalComponent implements OnInit, OnDestroy {
  @ViewChild('input') inputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('output') outputRef?: ElementRef<HTMLDivElement>;

  readonly prompt = PROMPT;
  isOpen = false;
  lines: Line[] = [];
  command = '';

  private history: string[] = [];
  private historyIndex = -1;
  private konamiIndex = 0;
  private greeted = false;
  private subscription?: Subscription;

  private readonly commands: Record<string, (args: string[]) => void> = {
    help: () => this.help(),
    whoami: () => this.whoami(),
    about: () => this.about(),
    skills: () => this.skills(),
    projects: () => this.projects(),
    experience: () => this.experience(),
    contact: () => this.contact(),
    ls: () => this.ls(),
    cd: args => this.goTo(args[0]),
    goto: args => this.goTo(args[0]),
    cat: args => this.cat(args[0]),
    cv: () => this.downloadCv(),
    wms: () => this.goTo('wms'),
    theme: args => this.theme(args[0]),
    lang: args => this.lang(args[0]),
    history: () => this.showHistory(),
    clear: () => (this.lines = []),
    exit: () => this.terminal.close(),
    echo: args => this.print(args.join(' ')),
    date: () => this.print(new Date().toString()),
    // Hidden commands
    sudo: args => this.sudo(args),
    hire: () => this.print(this.t('terminal.hireTip'), 'text-yellow-300'),
    matrix: () => this.matrix(),
    coffee: () => this.print(this.t('terminal.coffee')),
    rm: () => this.print(this.t('terminal.rmrf'), 'text-red-400')
  };

  constructor(
    private terminal: TerminalService,
    private effects: EffectsService,
    private colorTheme: ColorThemeService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.subscription = this.terminal.open$.subscribe(open => {
      this.isOpen = open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        if (!this.greeted) this.greet();
        this.focusInput();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    this.trackKonami(event.key);

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.terminal.toggle();
      return;
    }

    if (event.key === 'Escape' && this.isOpen) {
      this.terminal.close();
      return;
    }

    // Backtick opens it, unless the visitor is typing somewhere else
    if (event.key === '`' && !this.isOpen && !this.isTypingTarget(event.target)) {
      event.preventDefault();
      this.terminal.open();
    }
  }

  onInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        this.run(this.command);
        this.command = '';
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.browseHistory(1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.browseHistory(-1);
        break;
      case 'Tab':
        event.preventDefault();
        this.complete();
        break;
      case 'l':
        if (event.ctrlKey) {
          event.preventDefault();
          this.lines = [];
        }
        break;
    }
  }

  close(): void {
    this.terminal.close();
  }

  focusInput(): void {
    setTimeout(() => this.inputRef?.nativeElement.focus());
  }

  run(raw: string): void {
    const input = raw.trim();
    this.lines.push({ text: input, label: PROMPT, cls: 'text-white' });

    if (input) {
      this.history.unshift(input);
      this.historyIndex = -1;

      const [name, ...args] = input.split(/\s+/);
      const handler = this.commands[name.toLowerCase()];
      if (handler) {
        handler(args);
      } else {
        this.print(this.t('terminal.notFound', { cmd: name }), 'text-red-400');
      }
    }

    this.scrollToBottom();
  }

  // --- commands ---

  private greet(): void {
    this.greeted = true;
    BANNER.split('\n').slice(1).forEach(row => this.print(row, 'text-accent-400 whitespace-pre leading-tight'));
    this.print('');
    this.print(this.t('terminal.welcome'), 'text-white/70');
    this.print('');
  }

  private help(): void {
    this.print(this.t('terminal.help.title'), 'text-accent-400');
    const entries: Array<[string, string]> = [
      ['whoami', 'whoami'], ['about', 'about'], ['skills', 'skills'], ['projects', 'projects'],
      ['experience', 'experience'], ['contact', 'contact'], ['ls', 'ls'], ['cd <section>', 'cd'],
      ['cv', 'cv'], ['wms', 'wms'], ['theme <name>', 'theme'], ['lang <en|es>', 'lang'],
      ['history', 'history'], ['clear', 'clear'], ['exit', 'exit']
    ];
    entries.forEach(([cmd, key]) => this.lines.push({ label: cmd, text: this.t(`terminal.help.${key}`), cls: 'text-white/70' }));
    this.print(this.t('terminal.help.secret'), 'text-white/40');
  }

  private whoami(): void {
    this.print(this.t('hero.title'), 'text-white font-bold');
    this.print(this.t('hero.subtitle'), 'text-white/70');
    this.print(`📍 ${this.t('info.locationValue')}  ·  🗣 ${this.t('info.languagesValue')}`, 'text-white/50');
  }

  private about(): void {
    ['summary.p1', 'summary.p2', 'summary.p3'].forEach(key => {
      this.print(this.t(key), 'text-white/70');
      this.print('');
    });
  }

  private skills(): void {
    SKILL_GROUPS.forEach(group => this.lines.push({ label: this.t(group.titleKey), text: group.items, cls: 'text-white/70' }));
  }

  private projects(): void {
    PROJECTS.forEach(project => {
      this.print(`▸ ${this.t(project.name)}`, 'text-white');
      this.print(`  ${this.t(project.description)}`, 'text-white/60');
      this.lines.push({ text: `  ${project.url}`, href: project.url });
    });
  }

  private experience(): void {
    EXPERIENCE.forEach(item => {
      this.print(`▸ ${this.t(item.company)} — ${this.t(item.role)}`, 'text-white');
      this.print(`  ${this.t(item.period)} · ${this.t(item.location)}`, 'text-white/50');
    });
    this.print(`  → cd experience`, 'text-white/40');
  }

  private contact(): void {
    this.lines.push({ label: 'email', text: 'casavolalc@gmail.com', href: 'mailto:casavolalc@gmail.com' });
    this.lines.push({ label: 'linkedin', text: 'linkedin.com/in/lunacasavola', href: 'https://www.linkedin.com/in/lunacasavola' });
    this.lines.push({ label: 'cv', text: 'Luna-Casavola-CV.pdf', href: 'assets/Luna-Casavola-CV.pdf' });
  }

  private ls(): void {
    const dirs = SECTIONS.filter(s => s !== 'home').map(s => `${s}/`).join('  ');
    this.print(`${dirs}  about.md  cv.pdf`, 'text-accent-400');
  }

  private cat(file?: string): void {
    if (!file) return this.print(this.t('terminal.catUsage'), 'text-white/50');
    if (file === 'about.md') return this.about();
    if (file === 'cv.pdf') return this.print(this.t('terminal.catBinary'), 'text-yellow-300');
    this.print(`cat: ${file}: No such file or directory`, 'text-red-400');
  }

  private goTo(target?: string): void {
    const name = (target || 'home').replace(/\/$/, '').replace(/^~$/, 'home').toLowerCase();
    if (!SECTIONS.includes(name)) {
      return this.print(this.t('terminal.noSection', { name }), 'text-red-400');
    }

    this.print(this.t('terminal.going', { name }), 'text-white/60');
    setTimeout(() => {
      this.terminal.close();
      const id = name === 'home' ? 'hero' : name;
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }

  private downloadCv(): void {
    this.print(this.t('terminal.downloading'), 'text-white/60');
    const link = document.createElement('a');
    link.href = 'assets/Luna-Casavola-CV.pdf';
    link.download = 'Luna-Casavola-CV.pdf';
    link.click();
  }

  private theme(arg?: string): void {
    const value = arg?.toLowerCase();
    if (value === 'reset') {
      this.colorTheme.resetToDefault();
      return this.print(this.t('terminal.themeReset'), 'text-accent-400');
    }

    const color = value && (THEMES[value] ?? (/^#[0-9a-f]{6}$/.test(value) ? value : undefined));
    if (!color) {
      return this.print(this.t('terminal.themeUsage', { names: Object.keys(THEMES).join(', ') }), 'text-white/50');
    }

    this.colorTheme.setColor(color);
    this.print(this.t('terminal.themeSet', { color: value }), 'text-accent-400');
  }

  private lang(arg?: string): void {
    if (arg !== 'en' && arg !== 'es') {
      return this.print(this.t('terminal.langUsage'), 'text-white/50');
    }
    this.translate.use(arg).subscribe(() => this.print(this.t('terminal.langSet', { lang: arg }), 'text-accent-400'));
  }

  private showHistory(): void {
    [...this.history].reverse().forEach((cmd, i) => this.lines.push({ label: String(i + 1).padStart(3), text: cmd, cls: 'text-white/60' }));
  }

  private sudo(args: string[]): void {
    if (args.join(' ').toLowerCase() === 'hire luna') {
      this.print(this.t('terminal.hired'), 'text-accent-400');
      this.effects.confetti();
    } else {
      this.print(this.t('terminal.sudoDenied'), 'text-red-400');
    }
  }

  private matrix(): void {
    this.print(this.t('terminal.matrix'), 'text-accent-400');
    setTimeout(() => {
      this.terminal.close();
      this.effects.matrixRain();
    }, 700);
  }

  // --- helpers ---

  private print(text: string, cls = 'text-white/80'): void {
    this.lines.push({ text, cls });
  }

  private t(key: string, params?: object): string {
    return this.translate.instant(key, params);
  }

  private browseHistory(direction: 1 | -1): void {
    if (this.history.length === 0) return;
    this.historyIndex = Math.max(-1, Math.min(this.history.length - 1, this.historyIndex + direction));
    this.command = this.historyIndex === -1 ? '' : this.history[this.historyIndex];
  }

  /** Tab completion for command names and section arguments */
  private complete(): void {
    const [name, arg] = this.command.trimStart().split(/\s+/, 2);
    if (arg !== undefined && (name === 'cd' || name === 'goto')) {
      const match = SECTIONS.filter(s => s.startsWith(arg));
      if (match.length === 1) this.command = `${name} ${match[0]}`;
      return;
    }
    if (arg !== undefined && name === 'theme') {
      const match = Object.keys(THEMES).filter(s => s.startsWith(arg));
      if (match.length === 1) this.command = `${name} ${match[0]}`;
      return;
    }

    const visible = ['help', 'whoami', 'about', 'skills', 'projects', 'experience', 'contact', 'ls', 'cd', 'cat', 'cv', 'wms', 'theme', 'lang', 'history', 'clear', 'exit'];
    const matches = visible.filter(c => c.startsWith(name ?? ''));
    if (matches.length === 1) {
      this.command = `${matches[0]} `;
    } else if (matches.length > 1) {
      this.lines.push({ text: this.command, label: PROMPT, cls: 'text-white' });
      this.print(matches.join('  '), 'text-white/50');
      this.scrollToBottom();
    }
  }

  private trackKonami(key: string): void {
    this.konamiIndex = key === KONAMI[this.konamiIndex] ? this.konamiIndex + 1 : (key === KONAMI[0] ? 1 : 0);
    if (this.konamiIndex === KONAMI.length) {
      this.konamiIndex = 0;
      this.effects.matrixRain();
    }
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.outputRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
