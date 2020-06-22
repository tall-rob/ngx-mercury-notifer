import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { MercuryNotifierComponent } from './notifier.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    MercuryNotifierComponent,
  ],
  imports: [
    CommonModule,
    OverlayModule,
    BrowserAnimationsModule,
  ],
  exports: [
    MercuryNotifierComponent,
  ]
})
export class MercuryNotifierModule { }
