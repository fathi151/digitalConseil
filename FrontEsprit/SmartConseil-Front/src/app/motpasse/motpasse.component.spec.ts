import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotpasseComponent } from './motpasse.component';

import { getTestConfig } from '../testing/test-helpers';
describe('MotpasseComponent', () => {
  let component: MotpasseComponent;
  let fixture: ComponentFixture<MotpasseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [MotpasseComponent]
    });
    fixture = TestBed.createComponent(MotpasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
