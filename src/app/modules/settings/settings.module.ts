import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { UrlComponent } from './url/url.component';
import { HelpComponent } from './help/help.component';
import { PiaI18nModule } from '@atnos/pia-i18n';

@NgModule({
  declarations: [AboutComponent, UrlComponent, HelpComponent],
  imports: [PiaI18nModule, SharedModule, CommonModule, SettingsRoutingModule]
})
export class SettingsModule {}
