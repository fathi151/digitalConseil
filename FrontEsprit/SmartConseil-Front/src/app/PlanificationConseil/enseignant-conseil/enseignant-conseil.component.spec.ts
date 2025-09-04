import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnseignantConseilComponent } from './enseignant-conseil.component';

describe('EnseignantConseilComponent', () => {
  let component: EnseignantConseilComponent;
  let fixture: ComponentFixture<EnseignantConseilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
