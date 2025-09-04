import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardChefComponent } from './dashboard-chef.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardChefComponent', () => {
  let component: DashboardChefComponent;
  let fixture: ComponentFixture<DashboardChefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardChefComponent],
      imports: [RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
