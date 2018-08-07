import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from '@security/authentication.service';

@Injectable()
export class AuthenticationGuardService implements CanActivate {

  constructor(public authService: AuthenticationService, public router: Router) {}

  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      this.authService.isAuthenticated().then((response: boolean) => {
        if (!response) {
          this.router.navigate(['']);
        }
        resolve(response);
      });
    });
  }
}
