import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PiaComponent } from './pia.component';




@NgModule({
  imports: [RouterModule.forChild([
    { path: 'pia/:id', component: PiaComponent },
    { path: 'pia/:id/section/:section_id/item/:item_id', component: PiaComponent },
  ])],
  exports: [RouterModule]
})
export class PiaRoutingModule { }
