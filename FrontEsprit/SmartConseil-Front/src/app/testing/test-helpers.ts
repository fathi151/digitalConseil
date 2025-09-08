import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

export const TEST_IMPORTS = [
  HttpClientTestingModule,
  RouterTestingModule
];

export const TEST_PROVIDERS = [
  {
    provide: ActivatedRoute,
    useValue: {
      params: of({}),
      queryParams: of({}),
      snapshot: {
        params: {},
        queryParams: {},
        data: {}
      }
    }
  }
];

export const TEST_SCHEMAS = [CUSTOM_ELEMENTS_SCHEMA];

export const getTestConfig = (additionalImports: any[] = [], additionalProviders: any[] = []) => ({
  imports: [...TEST_IMPORTS, ...additionalImports],
  providers: [...TEST_PROVIDERS, ...additionalProviders],
  schemas: TEST_SCHEMAS
});
