import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BaseRoutingModule } from './base-routing.module';



@NgModule({
  declarations: [BaseComponent],
  imports: [
    SharedModule,
    CommonModule,
    BaseRoutingModule
  ],
})
export class BaseModule { }
