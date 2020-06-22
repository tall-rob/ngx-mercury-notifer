import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MercuryNotifierComponent, MERCURY_NOTIFIER_DEFAULT_SETTINGS } from './notifier.component';
import { MercuryNotifierModule } from './notifier.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NotifierComponent', () => {
  let component: MercuryNotifierComponent;
  let fixture: ComponentFixture<MercuryNotifierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MercuryNotifierModule,
        NoopAnimationsModule,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MercuryNotifierComponent);
    component = fixture.componentInstance;
    component.config = JSON.parse(JSON.stringify(MERCURY_NOTIFIER_DEFAULT_SETTINGS));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add and remove 1 notification', fakeAsync(() => {

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
  }));

  it('should merge a duplicate notification', fakeAsync(() => {

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

    tick(Infinity);

    expect(
      checks.every(Boolean)
    ).toBeTruthy();
  }));

  it('should not merge a duplicate notification', fakeAsync(() => {

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

    tick(Infinity);

    expect(
      checks.every(Boolean)
    ).toBeTruthy();
  }));

});
