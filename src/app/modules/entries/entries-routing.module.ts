import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guards';
import { EntriesComponent } from './entries.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'entries',
        component: EntriesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'entries/archive',
        component: EntriesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'entries/structure',
        component: EntriesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'entries/knowledge_bases',
        component: EntriesComponent,
        canActivate: [AuthGuard]
      }
    ])
  ],
  exports: [RouterModule]
})
export class EntriesRoutingModule {}
