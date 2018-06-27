import { ErrorHandler, Inject, Injector, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@security/authentication.service'

@Injectable()
export class AppErrorHandler implements ErrorHandler {

  constructor(private i18n: TranslateService, @Inject(Injector) private readonly injector: Injector) {

  }

  private get toastr(): ToastrService {
    return this.injector.get(ToastrService);
  }

  private get zone(): NgZone {
    return this.injector.get(NgZone);
  }

  private get router(): Router {
    return this.injector.get(Router);
  }

  private get auth(): AuthenticationService {
    return this.injector.get(AuthenticationService);
  }

  handleHttpError(httpError: HttpErrorResponse) {

    let trans = 'messages.http.' + httpError.status;
    if (httpError.error.error_code) {
      trans = trans + '.' + httpError.error.error_code;
    }

    this.toastr.error(
      this.i18n.instant(trans+'.content'),
      this.i18n.instant(trans+'.title')
    );
    switch (httpError.status) {
      case 401:
        this.auth.logout();
        this.zone.run(() => this.router.navigate([""]));
        break;
      default:

    }
  }

  handleClientError(error: Error) {
    this.toastr.error(
      this.i18n.instant('messages.client_error.content'),
      this.i18n.instant('messages.client_error.title')
    );
  }

  handleError(error: Error | HttpErrorResponse) {

    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
    console.error("Error happens", error);

  }

}