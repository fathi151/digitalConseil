import { TestBed } from '@angular/core/testing';

import { ConseilService } from './conseil.service';

import { getTestConfig } from '../testing/test-helpers';
describe('ConseilService', () => {
  let service: ConseilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConseilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
