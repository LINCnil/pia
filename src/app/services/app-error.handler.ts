import { ErrorHandler, Inject, Injector, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class AppErrorHandler implements ErrorHandler {

  constructor(private i18n:TranslateService, @Inject(Injector) private readonly injector: Injector) {

  }

  private get toastr(): ToastrService {
    return this.injector.get(ToastrService);
  }

  handleError(error: any) {
    if(error.rejection == undefined){
      console.error("Unknown Error", error);
      return;
    }

    let httpErrorCode = error.rejection.status;

    switch (httpErrorCode) {
      case 403:
        this.toastr.error(
          null,
          this.i18n.instant('messages.unauthorized_action.title')
        );

        break;
      case 500:
        this.toastr.error(
          null,
          this.i18n.instant('messages.server_error.title')
        );

        break;
      default:

    }
  }

}
