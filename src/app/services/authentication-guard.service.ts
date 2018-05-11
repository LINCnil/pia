import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationGuardService implements CanActivate {

  constructor(public authService: AuthenticationService, public router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
        return true;
    }

    this.router.navigate(['']);

    return false;
  }

}
