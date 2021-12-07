import { waitForAsync, TestBed } from '@angular/core/testing';

import { MercuryNotifierService } from './notifier.service';
import { ComponentRef } from '@angular/core';
import { MercuryNotifierComponent, MercuryNotifierSettings } from './notifier.component';
import { MercuryNotifierModule } from './notifier.module';
import { OverlayRef } from '@angular/cdk/overlay';

describe('MercuryNotifierService', () => {

  let service: MercuryNotifierService;
  let settings: MercuryNotifierSettings;

  beforeEach(waitForAsync(() => {
    settings = { duration: 5000 };
    TestBed.configureTestingModule({
      imports: [
        MercuryNotifierModule,
      ],
      providers: [
        {
          provide: 'MERCURY_NOTIFIER_SETTINGS',
          useValue: settings
        },
      ],
    });
    service = TestBed.inject(MercuryNotifierService);
  }));

  afterEach(() => service.ngOnDestroy());

  TestBed.configureTestingModule({
    imports: [
      MercuryNotifierModule,
    ],
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created with custom setting', () => {
    expect(service.config.duration === settings.duration).toBeTruthy();

    service.ngOnDestroy();
  });

  it('should override custom setting', () => {

    const newSettings = { duration: 3000 } as MercuryNotifierSettings;
    service.applySettings(newSettings);

    expect(service.config.duration === settings.duration).toBeFalsy();
    expect(service.config.duration === newSettings.duration).toBeTruthy();

    service.ngOnDestroy();
  });

  it('should attach overlay', () => {
    const overlayRef = (service as any).overlayRef as OverlayRef;

    expect(
      overlayRef.hasAttached(),
    ).toBeTruthy();
  });

  it('should detach overlay on Destroy', () => {
    const overlayRef = (service as any).overlayRef as OverlayRef;

    service.ngOnDestroy();

    expect(
      overlayRef.hasAttached(),
    ).toBeFalsy();
  });

  it('should create 1 notification', () => {
    const compRef = (service as any).compRef as ComponentRef<MercuryNotifierComponent>;

    service.notify('Test!');

    const notifier = compRef.instance;

    expect(
      notifier.notifications.size === 1,
    ).toBeTruthy();
  });

});
