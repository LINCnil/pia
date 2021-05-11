import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guards';
import { StructureComponent } from './structure.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'structures/:id',
        component: StructureComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'structures/:id/section/:section_id/item/:item_id',
        component: StructureComponent,
        canActivate: [AuthGuard]
      }
    ])
  ],
  exports: [RouterModule]
})
export class StructureRoutingModule {}
