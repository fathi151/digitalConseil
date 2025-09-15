import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierConsComponent } from './modifier-cons.component';

import { getTestConfig } from '../../testing/test-helpers';
describe('ModifierConsComponent', () => {
  let component: ModifierConsComponent;
  let fixture: ComponentFixture<ModifierConsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [ ModifierConsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierConsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
