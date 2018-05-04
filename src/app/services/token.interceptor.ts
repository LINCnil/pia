import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    if (token) {
    	const request1 = request.clone({
	        setHeaders: {
	          Authorization: `Bearer ${token}`
	        }
	      });

	      return next.handle(request1);
    }

    return next.handle(request);
  }
}
