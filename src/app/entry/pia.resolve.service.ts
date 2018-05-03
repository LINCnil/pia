import { Injectable } from '@angular/core';
import {Router, Resolve,ActivatedRouteSnapshot} from '@angular/router';
import { Pia as PiaModel } from '@api/model/pia.model';
import { PiaService } from './pia.service';

@Injectable()
export class PiaResolve implements Resolve<any> {
    constructor(private piaService: PiaService) { }

    resolve(route: ActivatedRouteSnapshot): Promise<any> {
        return this.piaService.getPIA();
    }
}
