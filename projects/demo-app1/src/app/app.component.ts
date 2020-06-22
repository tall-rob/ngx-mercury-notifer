import { Component, OnDestroy, Renderer2, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MercuryNotifierService, NotificationType, MercuryNotifierSettings } from 'ngx-mercury-notifier';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AbstractControl } from '@angular/forms';
import { DOCUMENT } from '@angular/common';


export enum Position {
  TOP_LEFT = 1,
  TOP_CENTER = 2,
  TOP_RIGHT = 3,
  BOTTOM_LEFT = 4,
  BOTTOM_CENTER = 5,
  BOTTOM_RIGHT = 6,
}

export function validSizeUnit(control: AbstractControl): { unit: boolean } | null {
  const fail = { unit: true };
  const value = ((control.value ?? '') as string).toLowerCase();

  if (['', 'unset', '0'].includes(value)) {
    // ignore valid empty values
    return null;
  }

  const regex = /([+-]?\d+(?:\.\d+)?)(.*)/g;
  const match = regex.exec(value);

  if (match.length !== 3) {
    // failed to match
    return fail;
  }

  const [_, numStr, unitVal] = match;

  const numVal = parseFloat(numStr);
  if (isNaN(numVal)) {
    return fail;
  }

  const legalUnits = [
    'cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex',
    'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%',
  ];
  if (!legalUnits.includes(unitVal)) {
    return fail;
  }

  return null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {

  Position = Position;

  globalSettings: FormGroup;
  messageSettings: FormGroup;

  private detectDarkmode = this.breakpointObserver.observe(
    [`(prefers-color-scheme: dark)`]
  ).pipe(map(s => !!s.matches));

  private subscription = new Subscription();

  private darkThemeDetected: boolean;
  private _isDarkTheme: boolean;
  get isDarkTheme(): boolean {
    return this._isDarkTheme;
  }
  set isDarkTheme(v: boolean) {
    this._isDarkTheme = v;
    const className = 'dark-theme';
    if (v) {
      this.renderer.addClass(this.doc.body, className);
    } else {
      this.renderer.removeClass(this.doc.body, className);
    }
  }

  private globalDefaults: Array<[string, any]>;
  private messageDefaults: Array<[string, any]>;

  constructor(
    private fb: FormBuilder,
    private notifer: MercuryNotifierService,
    private breakpointObserver: BreakpointObserver,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private doc: Document,
  ) {

    const { config } = this.notifer;

    this.globalSettings = this.fb.group({
      position: [Position.BOTTOM_RIGHT],
      theme: [config.theme],
      duration: [config.duration, {
        validators: [Validators.required, Validators.min(1000), Validators.max(60000)],
        updateOn: 'blur',
      }],
      canDismiss: [config.canDismiss],
      coalesce: [config.coalesce],
      maxWidth: [config.maxWidth, {
        validators: [Validators.required, validSizeUnit],
        updateOn: 'blur',
      }],
      rolloverPause: [config.rolloverPause],
    });

    this.globalDefaults = Object.entries(this.globalSettings.controls).map(pair => {
      return [pair[0], pair[1].value];
    }) as Array<[string, any]>;

    this.messageSettings = this.fb.group({
      message: ['Hello World!', {
        validators: [Validators.required],
        updateOn: 'blur',
      }],
      type: ['INFO'],
      duration: [null, {
        validators: [Validators.min(1000), Validators.max(60000)],
        updateOn: 'blur',
      }],
      canDismiss: [null],
    });

    this.messageDefaults = Object.entries(this.messageSettings.controls).map(pair => {
      return [pair[0], pair[1].value];
    }) as Array<[string, any]>;

    // Handle dark/light theme
    this.subscription.add(
      this.detectDarkmode.subscribe((v) => {
        this.darkThemeDetected = v;
        if (this.globalSettings.controls.theme.value === 'AUTO') {
          this.isDarkTheme = v;
        }
      })
    );
  }

  resetGlobalSettings(): void {
    this.globalDefaults.forEach(pair => {
      const [key, value] = pair;
      this.globalSettings.controls[key].setValue(value);
      this.updateSetting(this.globalSettings, key);
    });
  }

  resetMessageSettings(): void {
    this.messageDefaults.forEach(pair => {
      const [key, value] = pair;
      this.messageSettings.controls[key].setValue(value);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  showMessage(): void {
    const { controls } = this.messageSettings;
    const message = controls.message.value as string;
    const notificationType = controls.type.value as NotificationType;
    const duration = controls.duration.value as number;
    const canDismiss = controls.canDismiss.value as boolean;
    this.notifer.notify(
      message, notificationType, duration, canDismiss
    );
  }

  private setPageTheme(val: 'AUTO' | 'LIGHT-ON-DARK' | 'DARK-ON-LIGHT'): void {
    switch (val) {
      case 'AUTO': {
        this.isDarkTheme = this.darkThemeDetected;
        break;
      }
      case 'LIGHT-ON-DARK': {
        this.isDarkTheme = true;
        break;
      }
      case 'DARK-ON-LIGHT': {
        this.isDarkTheme = false;
        break;
      }
    }
  }

  showTestMessage(index: number) {
    switch (index) {
      case 1: {
        this.notifer.notify(
          'Lorem ipsum dolor sit amet',
        );
        break;
      }
      case 2: {
        this.notifer.notify(
          'Viverra orci sagittis eu volutpat odio facilisis', 'INFO',
        );
        break;
      }
      case 3: {
        this.notifer.notify(
          'Lacus vel facilisis volutpat est velit egestas', 'ACCEPT',
        );
        break;
      }
      case 4: {
        this.notifer.notify(
          'Ridiculus mus mauris vitae ultricies leo integer malesuada nunc vel', 'WARN',
        );
        break;
      }
      case 5: {
        this.notifer.notify(
          'Euismod in pellentesque massa placerat duis', 'FAIL',
        );
        break;
      }
      case 6: {
        this.notifer.notify(
          'Turpis massa tincidunt dui ut ornare', 'ERROR',
        );
        break;
      }
    }
  }

  updateSetting(formGroup: FormGroup, name: string): void {
    const control = formGroup.controls[name];
    if (control.invalid) {
      return;
    }
    const { value } = control;
    let settings: MercuryNotifierSettings = {};
    switch (name) {
      case 'position': {
        settings = this.getPositionSettings(value);
        break;
      }
      case 'theme': {
        this.setPageTheme(value);
        settings = { [name]: value };
        break;
      }
      default: {
        settings = { [name]: value };
      }
    }
    this.notifer.applySettings(settings);
  }

  private getPositionSettings(pos: Position): MercuryNotifierSettings {
    let settings: MercuryNotifierSettings = {};
    switch (pos) {
      case Position.TOP_LEFT: {
        settings = {
          direction: 'TOP-DOWN',
          top: '0', bottom: 'unset', left: '0', right: 'unset',
        };
        break;
      }
      case Position.TOP_CENTER: {
        settings = {
          direction: 'TOP-DOWN',
          top: '0', bottom: 'unset', left: '0', right: '0',
        };
        break;
      }
      case Position.TOP_RIGHT: {
        settings = {
          direction: 'TOP-DOWN',
          top: '0', bottom: 'unset', left: 'unset', right: '0',
        };
        break;
      }
      case Position.BOTTOM_LEFT: {
        settings = {
          direction: 'BOTTOM-UP',
          top: 'unset', bottom: '0', left: '0', right: 'unset',
        };
        break;
      }
      case Position.BOTTOM_CENTER: {
        settings = {
          direction: 'BOTTOM-UP',
          top: 'unset', bottom: '0', left: '0', right: '0',
        };
        break;
      }
      case Position.BOTTOM_RIGHT: {
        settings = {
          direction: 'BOTTOM-UP',
          top: 'unset', bottom: '0', left: 'unset', right: '0',
        };
        break;
      }
    }
    return settings;
  }

}
