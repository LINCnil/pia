import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { UserTokenModel } from '@api/models';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    if (UserTokenModel.hasLocalToken()) {
      const userToken = UserTokenModel.getLocalToken();
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${userToken.access_token}`
        }
      });
    }

    return next.handle(request);
  }
}
