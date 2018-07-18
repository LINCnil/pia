import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ProfileSession } from 'app/services/profile-session.service';

@Injectable()
export class PortfolioGuardService implements CanActivate {

  constructor(
    public session: ProfileSession,
    public router: Router
  ) { }

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      const hasPortfolio = this.session.hasPortfolioStructures();
      if (!hasPortfolio) {
        this.router.navigate(['dashboard']);
      }
      resolve(hasPortfolio);
    });
  }
}
