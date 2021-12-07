import { Injectable, Optional, Inject, ComponentRef, OnDestroy } from '@angular/core';
import { NotificationType, MercuryNotifierSettings, MERCURY_NOTIFIER_DEFAULT_SETTINGS } from './notifier.component';
import { MercuryNotifierComponent } from './notifier.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MercuryNotifierModule } from './notifier.module';

@Injectable({
  providedIn: MercuryNotifierModule
})
export class MercuryNotifierService implements OnDestroy {

  config: MercuryNotifierSettings = JSON.parse(JSON.stringify(MERCURY_NOTIFIER_DEFAULT_SETTINGS));
  private overlayRef: OverlayRef;
  private compRef: ComponentRef<MercuryNotifierComponent>;
  private notifierComponent: MercuryNotifierComponent;

  constructor(
    @Optional() @Inject('MERCURY_NOTIFIER_SETTINGS') settings: MercuryNotifierSettings,
    private overlay: Overlay,
  ) {
    if (settings) {
      this.applySettings(settings);
    }
    this.createPortal();
  }

  private createPortal(): void {

    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
    this.overlayRef.overlayElement.style.zIndex = this.config.zIndex;

    const portal = new ComponentPortal(MercuryNotifierComponent);
    this.compRef = this.overlayRef.attach(portal);
    this.notifierComponent = this.compRef.instance;
    this.notifierComponent.config = this.config;
  }

  applySettings(settings: MercuryNotifierSettings) {
    Object.assign(this.config, settings);
    this.compRef?.changeDetectorRef.detectChanges();
  }

  public notify(
    message: string, notificationType?: NotificationType,
    duration?: number, canDismiss?: boolean
  ): void {
    this.notifierComponent.notify.apply(this.notifierComponent, arguments);
  }

  ngOnDestroy() {
    this.overlayRef.dispose();
  }
}
