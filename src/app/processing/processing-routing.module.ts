import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProcessingComponent } from 'app/processing/processing.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';
import {ProcessingSectionsResolve} from 'app/processing/processing-form/processing-sections.resolve.service';
import {ProcessingResolve} from 'app/processing/processing.resolve.service';

const routes: Routes = [
  {
    path: 'processing/:id',
    component: ProcessingComponent,
    canActivate: [AuthenticationGuardService],
    resolve: {
      sections: ProcessingSectionsResolve,
      processing: ProcessingResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ProcessingSectionsResolve, ProcessingResolve]
})
export class ProcessingRoutingModule { }
