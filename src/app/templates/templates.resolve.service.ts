import { Injectable } from '@angular/core';
import {Router, Resolve} from '@angular/router';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';

import { TemplateApi } from '@api/services';
import { TemplateModel } from '@api/models';

@Injectable()
export class TemplatesResolve implements Resolve<any> {
    constructor(private templateApi: TemplateApi) { }

    resolve(): Observable<TemplateModel[]> {
      return this.templateApi.getAll();
    }
}
