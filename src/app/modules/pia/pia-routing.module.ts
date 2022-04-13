import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guards';
import { ExampleComponent } from './example/example.component';
import { PiaComponent } from './pia.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'preview/:id',
        component: ExampleComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'preview/:id/section/:section_id/item/:item_id',
        component: ExampleComponent
      },
      {
        path: 'pia/:id',
        component: PiaComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'pia/:id/section/:section_id/item/:item_id',
        component: PiaComponent,
        canActivate: [AuthGuard]
      }
    ])
  ],
  exports: [RouterModule]
})
export class PiaRoutingModule {}
