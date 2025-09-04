import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RappoteurConseilsComponent } from './rappoteur-conseils.component';

describe('RappoteurConseilsComponent', () => {
  let component: RappoteurConseilsComponent;
  let fixture: ComponentFixture<RappoteurConseilsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RappoteurConseilsComponent]
    });
    fixture = TestBed.createComponent(RappoteurConseilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
