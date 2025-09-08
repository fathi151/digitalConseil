import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSetupComponent } from './admin-setup.component';
import { getTestConfig } from '../testing/test-helpers';
describe('AdminSetupComponent', () => {
  let component: AdminSetupComponent;
  let fixture: ComponentFixture<AdminSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      ...getTestConfig(),
      declarations: [AdminSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});