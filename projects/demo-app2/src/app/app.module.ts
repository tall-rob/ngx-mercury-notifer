import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MercuryNotifierModule, MercuryNotifierSettings } from 'ngx-mercury-notifier';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MercuryNotifierModule,
  ],
  providers: [
    {
      provide: 'MERCURY_NOTIFIER_SETTINGS',
      useValue: { // 👈
        theme: 'DARK-ON-LIGHT',
        direction: 'BOTTOM-UP',
        top: 'unset', bottom: '0', left: 'unset', right: '0',
        maxWidth: '500px',
      } as MercuryNotifierSettings
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
