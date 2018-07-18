import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ProfileSession } from 'app/services/profile-session.service';

@Injectable()
export class StructureGuardService implements CanActivate {

  constructor(
    public session: ProfileSession,
    public router: Router
  ) { }

  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      const hasCurrentStructure = this.session.getCurrentStructure() !== null;
      if (!hasCurrentStructure) {
        this.router.navigate(['dashboard']);
      }
      resolve(hasCurrentStructure);
    });
  }
}
