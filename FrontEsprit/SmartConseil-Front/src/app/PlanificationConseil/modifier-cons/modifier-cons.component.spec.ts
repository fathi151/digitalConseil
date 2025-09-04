import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierConsComponent } from './modifier-cons.component';

describe('ModifierConsComponent', () => {
  let component: ModifierConsComponent;
  let fixture: ComponentFixture<ModifierConsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
