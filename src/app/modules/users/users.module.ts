import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersService } from 'src/app/services/users.service';
import { AuthService } from 'src/app/services/auth.service';
import { NewUserComponent } from './new-user/new-user.component';
import { PiaI18nModule } from '@atnos/pia-i18n';

@NgModule({
  declarations: [UsersComponent, NewUserComponent],
  imports: [SharedModule, PiaI18nModule, CommonModule, UsersRoutingModule],
  exports: [NewUserComponent],
  providers: [UsersService, AuthService]
})
export class UsersModule {}
