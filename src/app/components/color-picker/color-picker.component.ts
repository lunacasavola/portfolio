import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorThemeService } from '../../services/color-theme.service';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.css'
})
export class ColorPickerComponent implements OnInit, OnDestroy {
  @ViewChild('panel', { static: false }) panel?: ElementRef<HTMLDivElement>;
  isOpen = false;
  currentColor = '#00ff41';
  private subscription: any;

  constructor(private colorThemeService: ColorThemeService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.currentColor = this.colorThemeService.getColor();
    this.subscription = this.colorThemeService.color$.subscribe(color => {
      this.currentColor = color;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.isOpen && this.panel && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  togglePicker(): void {
    this.isOpen = !this.isOpen;
  }

  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.colorThemeService.setColor(input.value);
  }

  resetColor(): void {
    this.colorThemeService.resetToDefault();
  }
}

