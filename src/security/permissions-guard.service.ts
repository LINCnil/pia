import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

@Injectable()
export class PermissionsGuardService implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  	let allowed = true;
  	const requiredRoles = route.data.roles;
  	const userRoles = localStorage.getItem('roles');

  	requiredRoles.forEach(role => {
  		if(userRoles.indexOf(role) == -1) {
  			allowed = false;
  		}
  	})

		return allowed;
  }

}
