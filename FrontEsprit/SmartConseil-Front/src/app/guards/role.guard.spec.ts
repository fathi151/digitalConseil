import { TestBed } from '@angular/core/testing';
import { RoleGuard } from './role.guard';
import { getTestConfig } from '../testing/test-helpers';
describe('RoleGuard', () => {
  let guard: RoleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule]
    });
    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
