import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guards';
import { UsersComponent } from './users.component';
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AuthGuard]
      }
    ])
  ],
  exports: [RouterModule]
})
export class UsersRoutingModule {}
