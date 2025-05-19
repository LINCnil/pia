import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BaseRoutingModule } from './base-routing.module';
import { TranslatePipe } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [BaseComponent],
  imports: [
    SharedModule,
    CommonModule,
    BaseRoutingModule,
    TranslatePipe,
    FaIconComponent
  ]
})
export class BaseModule {}
