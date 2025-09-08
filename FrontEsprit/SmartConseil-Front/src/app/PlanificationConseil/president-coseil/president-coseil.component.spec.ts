import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresidentCoseilComponent } from './president-coseil.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('PresidentCoseilComponent', () => {
  let component: PresidentCoseilComponent;
  let fixture: ComponentFixture<PresidentCoseilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [PresidentCoseilComponent]
    });
    fixture = TestBed.createComponent(PresidentCoseilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
