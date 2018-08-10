import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { ProcessingModel } from '@api/models';
import { ProcessingApi } from '@api/services';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ProcessingResolve implements Resolve<any> {
  constructor(private processingApi: ProcessingApi) { }

  resolve(route: ActivatedRouteSnapshot): Observable<ProcessingModel> {
    const processingId = route.params.id;

    return this.processingApi.get(processingId);
  }
}
