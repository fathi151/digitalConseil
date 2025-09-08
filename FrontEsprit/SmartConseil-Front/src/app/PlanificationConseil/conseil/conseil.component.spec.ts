import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConseilComponent } from './conseil.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('ConseilComponent', () => {
  let component: ConseilComponent;
  let fixture: ComponentFixture<ConseilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [ConseilComponent]
    });
    fixture = TestBed.createComponent(ConseilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
