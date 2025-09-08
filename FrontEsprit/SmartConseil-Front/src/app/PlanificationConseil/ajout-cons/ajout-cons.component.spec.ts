import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutConsComponent } from './ajout-cons.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('AjoutConsComponent', () => {
  let component: AjoutConsComponent;
  let fixture: ComponentFixture<AjoutConsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [AjoutConsComponent]
    });
    fixture = TestBed.createComponent(AjoutConsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
