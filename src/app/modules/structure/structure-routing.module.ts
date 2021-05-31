import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StructureComponent } from './structure.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'structures/:id', component: StructureComponent },
      {
        path: 'structures/:id/section/:section_id/item/:item_id',
        component: StructureComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class StructureRoutingModule {}
