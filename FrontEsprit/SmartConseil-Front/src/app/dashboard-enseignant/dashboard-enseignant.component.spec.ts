import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardEnseignantComponent } from './dashboard-enseignant.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardEnseignantComponent', () => {
  let component: DashboardEnseignantComponent;
  let fixture: ComponentFixture<DashboardEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardEnseignantComponent],
      imports: [RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
