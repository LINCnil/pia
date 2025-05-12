import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { UrlComponent } from './url/url.component';
import { HelpComponent } from './help/help.component';
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  declarations: [AboutComponent, UrlComponent, HelpComponent],
  imports: [SharedModule, CommonModule, SettingsRoutingModule, TranslatePipe]
})
export class SettingsModule {}
