import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { UrlComponent } from './url/url.component';
@NgModule({
  imports: [RouterModule.forChild([
    { path: 'about', component: AboutComponent },
    { path: 'url', component: UrlComponent },
  ])],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
