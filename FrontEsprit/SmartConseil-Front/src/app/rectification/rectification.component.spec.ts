import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RectificationComponent } from './rectification.component';

import { getTestConfig } from '../testing/test-helpers';
describe('RectificationComponent', () => {
  let component: RectificationComponent;
  let fixture: ComponentFixture<RectificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [RectificationComponent]
    });
    fixture = TestBed.createComponent(RectificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
