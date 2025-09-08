import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnseignantConseilComponent } from './enseignant-conseil.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('EnseignantConseilComponent', () => {
  let component: EnseignantConseilComponent;
  let fixture: ComponentFixture<EnseignantConseilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [EnseignantConseilComponent]
    });
    fixture = TestBed.createComponent(EnseignantConseilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
