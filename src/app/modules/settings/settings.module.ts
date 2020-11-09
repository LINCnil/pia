import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';



@NgModule({
  declarations: [AboutComponent],
  imports: [
    SharedModule,
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
