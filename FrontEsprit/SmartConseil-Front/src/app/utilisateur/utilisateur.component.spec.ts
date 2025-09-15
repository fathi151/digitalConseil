import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurComponent } from './utilisateur.component';

import { getTestConfig } from '../testing/test-helpers';
describe('UtilisateurComponent', () => {
  let component: UtilisateurComponent;
  let fixture: ComponentFixture<UtilisateurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [UtilisateurComponent]
    });
    fixture = TestBed.createComponent(UtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
