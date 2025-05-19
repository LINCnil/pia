import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { UuidComponent } from './forms/uuid/uuid.component';
import { PasswordComponent } from './forms/password/password.component';
import { SignInComponent } from './forms/sign-in/sign-in.component';
import { ForgetPasswordComponent } from './forms/forget-password/forget-password.component';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  declarations: [
    HomeComponent,
    UuidComponent,
    PasswordComponent,
    SignInComponent,
    ForgetPasswordComponent
  ],
  providers: [AuthService, ApiService],
  imports: [SharedModule, CommonModule, HomeRoutingModule, TranslatePipe]
})
export class HomeModule {}
