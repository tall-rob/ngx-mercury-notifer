import { async, TestBed } from '@angular/core/testing';

import { MercuryNotifierService } from './notifier.service';
import { ComponentRef } from '@angular/core';
import { MercuryNotifierComponent } from './notifier.component';
import { MercuryNotifierModule } from './notifier.module';
import { OverlayRef } from '@angular/cdk/overlay';

describe('MercuryNotifierService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MercuryNotifierModule,
      ],
    });
  }));

  it('should be created', () => {
    const service: MercuryNotifierService = TestBed.inject(MercuryNotifierService);
    expect(service).toBeTruthy();
  });

  it('should attach overlay', () => {
    const service: MercuryNotifierService = TestBed.inject(MercuryNotifierService);

    const overlayRef = (service as any).overlayRef as OverlayRef;

    expect(
      overlayRef.hasAttached(),
    ).toBeTruthy();
  });

  it('should create 1 notification', () => {
    const service: MercuryNotifierService = TestBed.inject(MercuryNotifierService);

    const compRef = (service as any).compRef as ComponentRef<MercuryNotifierComponent>;

    service.notify('Test!');

    const notifier = compRef.instance;

    expect(
      notifier.notifications.size === 1,
    ).toBeTruthy();
  });

});
