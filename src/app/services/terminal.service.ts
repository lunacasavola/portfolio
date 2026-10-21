import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Lets any component (navbar, hero hint...) open the terminal overlay */
@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  private openSubject = new BehaviorSubject<boolean>(false);
  public open$ = this.openSubject.asObservable();

  get isOpen(): boolean {
    return this.openSubject.value;
  }

  open(): void {
    this.openSubject.next(true);
  }

  close(): void {
    this.openSubject.next(false);
  }

  toggle(): void {
    this.openSubject.next(!this.openSubject.value);
  }
}
