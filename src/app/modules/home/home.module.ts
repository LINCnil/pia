import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { PiaI18nModule } from '@atnos/pia-i18n';

@NgModule({
  declarations: [HomeComponent],
  imports: [PiaI18nModule, SharedModule, CommonModule, HomeRoutingModule]
})
export class HomeModule {}
