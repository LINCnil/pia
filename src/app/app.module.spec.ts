import { HttpBackend, HttpXhrBackend } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AppModule } from './app.module';
import { SharedModule } from './shared/shared.module';

describe('HTTP backend configuration', () => {
  it('uses XHR in AppModule', () => {
    TestBed.configureTestingModule({ imports: [AppModule] });

    expect(TestBed.inject(HttpBackend)).toBeInstanceOf(HttpXhrBackend);
  });

  it('uses XHR in SharedModule', () => {
    TestBed.configureTestingModule({ imports: [SharedModule] });

    expect(TestBed.inject(HttpBackend)).toBeInstanceOf(HttpXhrBackend);
  });
});
