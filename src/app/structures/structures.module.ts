import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
import { StructuresRoutingModule } from './structures-routing.module';
import { StructuresComponent } from './structures.component';
import { CardItemComponent } from './card-item/card-item.component';
import { ListItemComponent } from './list-item/list-item.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    StructuresRoutingModule
  ],
  declarations: [
    StructuresComponent,
    CardItemComponent,
    ListItemComponent
  ]
})
export class StructuresModule { }
