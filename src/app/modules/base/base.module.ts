import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BaseRoutingModule } from './base-routing.module';
import { PiaI18nModule } from '@atnos/pia-i18n';

@NgModule({
  declarations: [BaseComponent],
  imports: [PiaI18nModule, SharedModule, CommonModule, BaseRoutingModule]
})
export class BaseModule {}
