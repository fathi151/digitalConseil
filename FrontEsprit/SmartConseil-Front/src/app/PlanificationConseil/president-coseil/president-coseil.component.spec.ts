import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresidentCoseilComponent } from './president-coseil.component';

describe('PresidentCoseilComponent', () => {
  let component: PresidentCoseilComponent;
  let fixture: ComponentFixture<PresidentCoseilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
