import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user: User = this.authService.currentUserValue;
    const correspondance = {
      technique: ['users', 'pia', 'entries'],
      fonctionnel: ['pia', 'entries'],
      user: ['pia', 'entries']
    };

    const module = state.url.split('/')[1];

    if (!this.authService.state) {
      // LOCAL MODE
      return true;
    } else {
      // CLIENT - SERVER MODE
      if (!this.authService.currentUserValue) {
        // NO USER AUTHENTIFIED
        this.router.navigate(['/']);
        return true;
      }

      // AUTH MODE, CHECK IF USER CAN HAVE ACCESS TO ROUTE

      let bool: boolean;
      switch (module) {
        case 'users':
          bool = this.authService.currentUserValue.access_type.includes(
            'technical'
          );
          break;
        case 'pia':
          bool =
            this.authService.currentUserValue.access_type.includes(
              'functional'
            ) && this.authService.currentUserValue.access_type.includes('user');
          break;
        case 'entries':
          bool =
            this.authService.currentUserValue.access_type.includes(
              'functional'
            ) && this.authService.currentUserValue.access_type.includes('user');
          break;
        default:
          bool = true; // EVERY ELSE
          break;
      }
      return bool;
    }
  }
}
