import { Component } from '@angular/core';
import { MercuryNotifierService } from 'ngx-mercury-notifier';

@Component({
  selector: 'app-root',
  template: `<button (click)="test()">Hello World</button>`,
  styles: []
})
export class AppComponent {
  constructor(
    private notifier: MercuryNotifierService
  ) {}
  test(): void {
    this.notifier.notify('Hello World!'); // 👈
  }
}
