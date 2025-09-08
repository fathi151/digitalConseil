import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalleComponent } from './salle.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('SalleComponent', () => {
  let component: SalleComponent;
  let fixture: ComponentFixture<SalleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [SalleComponent]
    });
    fixture = TestBed.createComponent(SalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
