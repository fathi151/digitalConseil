import { TestBed } from '@angular/core/testing';

import { RectificationService } from './rectification.service';

import { getTestConfig } from '../testing/test-helpers';
describe('RectificationService', () => {
  let service: RectificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RectificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
