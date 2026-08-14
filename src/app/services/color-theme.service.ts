import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColorThemeService {
  private readonly defaultColor = '#00ff41'; // Matrix green
  private colorSubject = new BehaviorSubject<string>(this.getStoredColor());
  public color$ = this.colorSubject.asObservable();

  constructor() {
    this.applyColor(this.colorSubject.value);
  }

  private getStoredColor(): string {
    const stored = localStorage.getItem('accentColor');
    return stored || this.defaultColor;
  }

  setColor(color: string): void {
    localStorage.setItem('accentColor', color);
    this.colorSubject.next(color);
    this.applyColor(color);
  }

  getColor(): string {
    return this.colorSubject.value;
  }

  private applyColor(color: string): void {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Calculate lighter and darker variants
    const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.3));
    const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.3));
    const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.3));

    const darkR = Math.max(0, Math.floor(r * 0.8));
    const darkG = Math.max(0, Math.floor(g * 0.8));
    const darkB = Math.max(0, Math.floor(b * 0.8));

    // Set CSS custom properties
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-light', `rgb(${lightR}, ${lightG}, ${lightB})`);
    document.documentElement.style.setProperty('--accent-dark', `rgb(${darkR}, ${darkG}, ${darkB})`);
    document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
  }

  resetToDefault(): void {
    this.setColor(this.defaultColor);
  }
}

