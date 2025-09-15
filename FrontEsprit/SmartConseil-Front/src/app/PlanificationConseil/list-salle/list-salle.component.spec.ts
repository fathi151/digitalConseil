import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSalleComponent } from './list-salle.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('ListSalleComponent', () => {
  let component: ListSalleComponent;
  let fixture: ComponentFixture<ListSalleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [ListSalleComponent]
    });
    fixture = TestBed.createComponent(ListSalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
