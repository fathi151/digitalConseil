import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { getTestConfig } from '../testing/test-helpers';
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
