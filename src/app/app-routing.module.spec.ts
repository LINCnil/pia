import { TestBed } from '@angular/core/testing';
import { ROUTER_CONFIGURATION } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

describe('AppRoutingModule', () => {
  it('keeps the previous route parameter inheritance strategy', () => {
    TestBed.configureTestingModule({ imports: [AppRoutingModule] });

    expect(TestBed.inject(ROUTER_CONFIGURATION).paramsInheritanceStrategy).toBe(
      'emptyOnly'
    );
  });
});
