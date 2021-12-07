import { Component, OnInit, Input, HostBinding, OnDestroy } from '@angular/core';
import { notifyAnimation } from './animations';
import { KeyValue } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

export type NotificationType = null | 'INFO' | 'ACCEPT' | 'WARN' | 'FAIL' | 'ERROR';
export type NotifierDirection = 'TOP-DOWN' | 'BOTTOM-UP';
export type NotifierTheme = 'AUTO' | 'LIGHT-ON-DARK' | 'DARK-ON-LIGHT';

export interface MercuryNotifierSettings {
  duration?: number;
  direction?: NotifierDirection;
  theme?: NotifierTheme;
  canDismiss?: boolean;
  coalesce?: boolean;
  zIndex?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  maxWidth?: string;
  rolloverPause?: boolean;
}

export const MERCURY_NOTIFIER_DEFAULT_SETTINGS: MercuryNotifierSettings = {
  duration: 6000,
  direction: 'BOTTOM-UP',
  theme: 'AUTO',
  canDismiss: true,
  coalesce: true,
  zIndex: '9999',
  top: 'unset',
  bottom: '0',
  left: 'unset',
  right: '0',
  maxWidth: '500px',
  rolloverPause: true,
};

export class Notification {

  canDismiss: boolean;
  message: string;
  notificationType: NotificationType;
  createdOn: number;
  tally = 1;

  get key(): number {
    return this.createdOn;
  }

  get value(): string {
    return JSON.stringify([this.notificationType, this.message]);
  }

  constructor(message: string, notificationType: NotificationType | null, canDismiss: boolean) {
    this.message = message;
    this.notificationType = notificationType;
    this.canDismiss = canDismiss;
    this.createdOn = Date.now();
  }
}

@Component({
  selector: 'lib-mercury-notifier',
  templateUrl: './notifier.component.html',
  styleUrls: ['./notifier.component.scss'],
  animations: [
    notifyAnimation,
  ]
})
export class MercuryNotifierComponent implements OnInit, OnDestroy {

  @Input() config: MercuryNotifierSettings;
  notifications = new Map<number, Notification>();
  private valueByKey = new Map<string, number>();
  private holdTicks: number = null;
  private holdKeys: Array<number> = [];
  private detectDarkmode = this.breakpointObserver.observe([`(prefers-color-scheme: dark)`]).pipe(map(s => !!s.matches));
  private subscription = new Subscription();

  @HostBinding('style.--top') get topCSSVar(): string {
    return this.config?.top ?? 'unset';
  }
  @HostBinding('style.--bottom') get bottomCSSVar(): string {
    return this.config?.bottom ?? '0';
  }
  @HostBinding('style.--left') get leftCSSVar(): string {
    return this.config?.left ?? 'unset';
  }
  @HostBinding('style.--right') get rightCSSVar(): string {
    return this.config?.right ?? 'unset';
  }
  @HostBinding('style.--max-width') get maxWidthCSSVar(): string {
    return this.config?.maxWidth ?? 'unset';
  }
  @HostBinding('class.bottom-up') get bottomUp(): boolean {
    return this.config?.direction === 'BOTTOM-UP';
  }

  private prefersLightOnDark: boolean;
  @HostBinding('class.light-on-dark') get lightOnDark(): boolean {
    switch (this.config?.theme) {
      case 'AUTO': {
        return this.prefersLightOnDark;
      }
      case 'LIGHT-ON-DARK': {
        return true;
      }
      default: {
        return false;
      }
    }
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.detectDarkmode.subscribe(res => this.prefersLightOnDark = res)
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackByKey(index: number, kvp: KeyValue<number, Notification>): number {
    return kvp.key;
  }

  destroy(notification: Notification): void {
    if (!!notification) {
      const key = notification.createdOn;
      const value = notification.value;
      if (this.valueByKey.get(value) === key) {
        this.valueByKey.delete(value);
      }
      this.notifications.delete(key);
    }
  }

  private isOnHold(): boolean {
    return this.holdTicks !== null;
  }

  holdOn(notification: Notification): void {
    if (this.config.rolloverPause) {
      this.holdTicks = notification.createdOn;
    }
  }

  holdOff(): void {
    this.holdTicks = null;
    while (this.holdKeys.length > 0) {
      const key = this.holdKeys.pop();
      // Held notifications expire in half the default time
      const duration = Math.round(this.config.duration * 0.5);
      setTimeout(_ => this.expire(key), duration);
    }
  }

  private expire(key: number): void {
    if (!this.isOnHold() || key > this.holdTicks) {
      this.destroy(this.notifications.get(key));
    } else {
      this.holdKeys.unshift(key);
    }
  }

  notify(
    message: string, notificationType: NotificationType = null,
    duration?: number, canDismiss?: boolean
  ): void {
    const notification = new Notification(message, notificationType, canDismiss ?? this.config.canDismiss);
    const { key, value } = notification;

    if (this.config.coalesce) {
      const oldKey = this.valueByKey.get(value);
      if (oldKey) {
        const oldNotification = this.notifications.get(oldKey);
        notification.tally = oldNotification.tally + 1;
        this.destroy(this.notifications.get(oldKey));
      }
    }

    this.notifications.set(key, notification);
    this.valueByKey.set(value, key);

    setTimeout(_ => this.expire(key), duration ?? this.config.duration);
  }

}
