import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MercuryNotifierComponent, MERCURY_NOTIFIER_DEFAULT_SETTINGS } from './notifier.component';
import { MercuryNotifierModule } from './notifier.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MercuryNotifierSettings } from 'ngx-mercury-notifier';

describe('NotifierComponent', () => {
  let component: MercuryNotifierComponent;
  let fixture: ComponentFixture<MercuryNotifierComponent>;
  let config: MercuryNotifierSettings;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MercuryNotifierModule,
        NoopAnimationsModule,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    config = JSON.parse(JSON.stringify(MERCURY_NOTIFIER_DEFAULT_SETTINGS));
    fixture = TestBed.createComponent(MercuryNotifierComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should have assigned host bindings', () => {
    fixture.detectChanges();

    const checks: Array<boolean> = [];

    checks.push(
      !!component.leftCSSVar
    );
    checks.push(
      !!component.rightCSSVar
    );
    checks.push(
      !!component.topCSSVar
    );
    checks.push(
      !!component.bottomCSSVar
    );
    checks.push(
      typeof component.bottomUp == 'boolean'
    );

    expect(
      checks.every(Boolean)
    ).toBeTruthy();
  });

  it('should add and remove 1 notification', fakeAsync(() => {

    component.config = config;
    fixture.detectChanges();

    const checks: Array<boolean> = [];

    // Should have no notifications
    checks.push(
      component.notifications.size === 0
    );

    fixture.detectChanges();

    // Create 1 notification
    const message = 'Test!';
    component.notify(message, null, 3000);

    // Should have 1 notification added
    checks.push(
      component.notifications.size === 1
    );

    tick(1000);

    fixture.detectChanges();

    // Should match message text
    checks.push(
      fixture.debugElement.queryAll(By.css('.notifier .message'))[0].nativeElement.innerHTML === message
    );

    tick(2000);

    // Should have removed notification
    checks.push(
      component.notifications.size === 0
    );

    fixture.detectChanges();

    // Should not find any notifications
    checks.push(
      fixture.debugElement.queryAll(By.css('.notifier .message')).length === 0
    );

    expect(
      checks.every(Boolean)
    ).toBeTruthy();

    flush();
  }));

  it('should add, hold, and remove 1 notification', fakeAsync(() => {

    config.rolloverPause = true;
    component.config = config;
    fixture.detectChanges();

    const checks: Array<boolean> = [];

    // Should have no notifications
    checks.push(
      component.notifications.size === 0
    );

    // Create 1 notification
    const message = 'Test!';
    component.notify(message, null);

    // Should have 1 notification added
    checks.push(
      component.notifications.size === 1
    );

    const [_, notification] = [...component.notifications][0];

    tick(2900);

    component.holdOn(notification);

    tick(9000);

    // Should still have 1 notification added
    checks.push(
      component.notifications.size === 1
    );

    component.holdOff();

    tick(3000);

    // Should have no notifications
    checks.push(
      component.notifications.size === 0
    );

    expect(
      checks.every(Boolean)
    ).toBeTruthy();

    flush();
  }));

  it('should toggle dark/light mode using config theme', fakeAsync(() => {

    component.config = config;
    fixture.detectChanges();

    const checks: Array<boolean> = [];

    component.config.theme = 'LIGHT-ON-DARK';

    tick(1000);

    fixture.detectChanges();

    // Should have theme class
    checks.push(
      fixture.nativeElement.classList.contains('light-on-dark') === true
    );

    component.config.theme = 'DARK-ON-LIGHT';

    tick(1000);

    fixture.detectChanges();

    // Should have NOT have theme class
    checks.push(
      fixture.nativeElement.classList.contains('dark-on-light') === false
    );

    expect(
      checks.every(Boolean)
    ).toBeTruthy();

    flush();
  }));

  it('should display close button based on canDismiss flag', fakeAsync(() => {

    component.config = config;
    fixture.detectChanges();

    const checks: Array<boolean> = [];

    // Should have no notifications
    checks.push(
      component.notifications.size === 0
    );

    fixture.detectChanges();

    // canDismiss Should be true
    checks.push(
      component.config.canDismiss === true
    );

    // Create 1 notification that can dismiss based on config
    const message = 'Test!';
    component.notify(message, null, 3000);

    tick(1000);

    fixture.detectChanges();

    // Should have close button
    checks.push(
      fixture.debugElement.queryAll(By.css('.notifier .close')).length === 1
    );

    tick(3000);

    // Should have no notifications
    checks.push(
      component.notifications.size === 0
    );

    // Create 1 notification that cannot dismiss
    component.notify(message, null, 3000, false);

    tick(1000);

    fixture.detectChanges();

    // Should have close button
    checks.push(
      fixture.debugElement.queryAll(By.css('.notifier .close')).length === 0
    );

    expect(
      checks.every(Boolean)
    ).toBeTruthy();

    flush();
  }));

  it('should merge a duplicate notification', fakeAsync(() => {

    component.config = config;
    fixture.detectChanges();

    const checks: Array<boolean> = [];

    // Set coalesce flag true
    component.config.coalesce =  true;

    fixture.detectChanges();

    // Create 1 notification
    const message = 'Test!';
    component.notify(message, 'INFO', 3000);

    tick(1000);

    // Should have 1 notification added
    checks.push(
      component.notifications.size === 1
    );

    // Create duplicate notification
    component.notify(message, 'INFO', 3000);

    tick(1000);

    // Should still have 1 notification
    checks.push(
      component.notifications.size === 1
    );

    fixture.detectChanges();

    // Should have tally
    checks.push(
      fixture.debugElement.queryAll(By.css('.notifier .tally'))[0].nativeElement.innerHTML === '2'
    );

    expect(
      checks.every(Boolean)
    ).toBeTruthy();

    flush();
  }));

  it('should not merge a duplicate notification', fakeAsync(() => {

    component.config = config;
    fixture.detectChanges();

    const checks: Array<boolean> = [];

    // Set coalesce flag false
    component.config.coalesce =  false;

    fixture.detectChanges();

    // Create 1 notification
    const message = 'Test!';
    component.notify(message, 'INFO', 3000);

    tick(1000);

    // Should have 1 notification added
    checks.push(
      component.notifications.size === 1
    );

    // Create duplicate notification
    component.notify(message, 'INFO', 3000);

    tick(1000);

    // Should have 2 notifications
    checks.push(
      component.notifications.size === 2
    );

    fixture.detectChanges();

    // Should have no tally
    checks.push(
      fixture.debugElement.queryAll(By.css('.notifier .tally')).length === 0
    );

    expect(
      checks.every(Boolean)
    ).toBeTruthy();

    flush();
  }));

});
