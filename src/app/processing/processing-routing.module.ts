import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProcessingComponent } from 'app/processing/processing.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';
import {ProcessingSectionsResolve} from 'app/processing/processing-form/processing-sections.resolve.service';
import {ProcessingService} from 'app/processing/processing.service';

const routes: Routes = [
  {
    path: 'processing',
    component: ProcessingComponent,
    canActivate: [AuthenticationGuardService],
    resolve: { sections: ProcessingSectionsResolve }
  },
  {
    path: 'processing/:id',
    component: ProcessingComponent,
    canActivate: [AuthenticationGuardService],
    resolve: { sections: ProcessingSectionsResolve }
  },
  {
    path: 'processing/:id/section/:section_id/item/:item_id',
    component: ProcessingComponent,
    canActivate: [AuthenticationGuardService],
    resolve: { sections: ProcessingSectionsResolve }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ProcessingSectionsResolve]
})
export class ProcessingRoutingModule { }
