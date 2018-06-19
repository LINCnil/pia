import { ErrorHandler, Inject, Injector, Injectable, NgZone } from '@angular/core';
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



  handleError(error: any) {
    if (error.rejection == undefined) {
      console.error("Unknown Error", error);
      return;
    }

    let httpErrorCode = error.rejection.status;

    switch (httpErrorCode) {
      case 401:
        this.toastr.error(
          null,
          this.i18n.instant('messages.unauthorized.title')
        );
        this.auth.logout();
        this.zone.run(()=>this.router.navigate([""]));
        break;
      case 403:
        this.toastr.error(
          null,
          this.i18n.instant('messages.forbidden.title')
        );

        break;
      case 500:
        this.toastr.error(
          null,
          this.i18n.instant('messages.fatal_error.title')
        );

        break;
      default:

    }
  }

}
