import { Injectable } from '@angular/core';
import {Resolve} from '@angular/router';
import { ProcessingArchitectureService } from '../../services/processing-architecture.service';

@Injectable()
export class ProcessingSectionsResolve implements Resolve<any> {
    constructor(private processingArchitectureService: ProcessingArchitectureService) { }

    resolve(): Promise<any> {
      return this.processingArchitectureService.getSections();
    }
}
