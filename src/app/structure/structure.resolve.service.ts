import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { StructureModel } from '@api/models';
import { StructureApi } from '@api/services';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class StructureResolve implements Resolve<StructureModel> {
  constructor(private structureApi: StructureApi) { }

  resolve(route: ActivatedRouteSnapshot): Observable<StructureModel> {
    const structureId = route.params.id;

    return this.structureApi.get(structureId);
  }
}
