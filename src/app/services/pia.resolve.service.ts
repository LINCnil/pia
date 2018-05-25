import { Injectable } from '@angular/core';
import {Router, Resolve,  CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { Pia as PiaModel } from '@api/model/pia.model';
import { PiaService } from 'app/entry/pia.service';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';

@Injectable()
export class PiaResolve implements Resolve<any>, CanActivate {
    constructor(private piaService: PiaService) { }

    resolve(route: ActivatedRouteSnapshot): Promise<any> {
        return this.piaService.getPIA();
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
      const piaId = route.params.id;
      return this.piaService.retrieveCurrentPIA(piaId)
        .map((data) => true)
        .catch((error) => Observable.of(false));
    }
}
