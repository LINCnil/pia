import * as Rollbar from 'rollbar';
import { ErrorHandler, Injectable, Injector, InjectionToken } from '@angular/core';
import { environment } from 'environments/environment';

export let rollbarConfig = {
    accessToken: environment.rollbar_key,
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: (environment.rollbar_key.length > 0),
    environment: environment.name,
    autoInstrument: true,
    payload: {
      client: {
        javascript: {
          code_version: environment.version,
          source_map_enabled: true
        }
      }
    }
}

@Injectable()
export class RollbarErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(err: any): void {
    const rollbar = this.injector.get(RollbarService);
    rollbar.error(err.originalError || err);
  }
}

export function rollbarFactory() {
    return new Rollbar(rollbarConfig);
}

export const RollbarService = new InjectionToken<Rollbar>('rollbar');
