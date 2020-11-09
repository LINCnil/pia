import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './about/about.component';
@NgModule({
  imports: [RouterModule.forChild([
    { path: 'about', component: AboutComponent },
  ])],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
