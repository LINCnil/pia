import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersService } from 'src/app/services/users.service';
import { AuthService } from 'src/app/services/auth.service';
import { NewUserComponent } from './new-user/new-user.component';
import { TranslatePipe } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [UsersComponent, NewUserComponent],
  imports: [
    SharedModule,
    CommonModule,
    UsersRoutingModule,
    TranslatePipe,
    FaIconComponent
  ],
  exports: [NewUserComponent],
  providers: [UsersService, AuthService]
})
export class UsersModule {}
