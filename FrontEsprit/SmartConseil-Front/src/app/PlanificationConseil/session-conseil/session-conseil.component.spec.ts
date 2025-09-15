import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionConseilComponent } from './session-conseil.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('SessionConseilComponent', () => {
  let component: SessionConseilComponent;
  let fixture: ComponentFixture<SessionConseilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [SessionConseilComponent]
    });
    fixture = TestBed.createComponent(SessionConseilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
