import { Injectable } from '@angular/core';
import {Resolve,  CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { Processing as ProcessingModel } from '@api/model/processing.model';
import { ProcessingService } from 'app/processing/processing.service';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';

@Injectable()
export class ProcessingResolve implements Resolve<any>, CanActivate {
    constructor(private processingService: ProcessingService) { }

    resolve(route: ActivatedRouteSnapshot): Promise<any> {
        return this.processingService.getProcessing();
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
      const processingId = route.params.id;

      return this.processingService.retrieveCurrentProcessing(processingId)
        .map((data) => true)
        .catch((error) => Observable.of(false));
    }
}
