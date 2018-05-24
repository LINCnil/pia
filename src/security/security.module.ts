import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { NgxPermissionsModule } from 'ngx-permissions';
import {PermissionsService} from './permissions.service';

@NgModule({
  declarations: [],
  imports: [
    HttpModule,
    NgxPermissionsModule.forRoot()
  ],
  exports:[
    NgxPermissionsModule
  ],
  providers: [
    PermissionsService
  ]
})

export class SecurityModule { }
