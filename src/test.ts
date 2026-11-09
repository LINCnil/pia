// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

@NgModule({
  imports: [BrowserDynamicTestingModule],
  providers: [provideZoneChangeDetection()],
})
class AppTestingModule {}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  AppTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: true },
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  }
);
