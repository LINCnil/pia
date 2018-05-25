import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PermissionsService } from './permissions.service';
import { AuthenticationService } from './authentication.service';
import { AuthenticationGuardService } from './authentication-guard.service';
import { TokenInterceptor } from './token.interceptor';

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule,
    NgxPermissionsModule.forRoot()
  ],
  exports: [
    NgxPermissionsModule
  ],
  providers: [
    PermissionsService,
    AuthenticationService,
    AuthenticationGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
})

export class SecurityModule { }
