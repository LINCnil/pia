import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationGuardService implements CanActivate {

  constructor(public authService: AuthenticationService, public router: Router) {}

  canActivate(): boolean {
 
  	let can = true;

  	this.authService.isAuthenticated().then(response => {
  		can = response;
  	});

  	if(!can) {
  		this.router.navigate(['']);
  	}

    return can;
  }

}
