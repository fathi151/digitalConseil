import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConseilEnCoursComponent } from './conseil-en-cours.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('ConseilEnCoursComponent', () => {
  let component: ConseilEnCoursComponent;
  let fixture: ComponentFixture<ConseilEnCoursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [ConseilEnCoursComponent]
    });
    fixture = TestBed.createComponent(ConseilEnCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
