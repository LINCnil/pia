import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationGuardService implements CanActivate {

  constructor(public authService: AuthenticationService, public router: Router) {}

  canActivate(): boolean {
    if(this.authService.isLoggedIn()) {
        return true;
    }

    //this.authService.startAuthentication();

    return true;
    // if (!this.auth.isAuthenticated()) {
    //   this.router.navigate(['']);
      
    //   return false;
    // }
    // return true;
  }

}