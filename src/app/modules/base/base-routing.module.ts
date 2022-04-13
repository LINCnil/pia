import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guards';
import { BaseComponent } from './base.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'knowledge_bases/:id',
        component: BaseComponent,
        canActivate: [AuthGuard]
      }
    ])
  ],
  exports: [RouterModule]
})
export class BaseRoutingModule {}
