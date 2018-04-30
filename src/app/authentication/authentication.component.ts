import { Component } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages.service';
import { AuthenticationService } from 'app/services/authentication.service';
import { User } from 'app/authentication/user.model';


@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent{
  private user = new User(0, '', '');

  constructor(public authService: AuthenticationService, public router: Router) {}


  onSubmit() {
    this.authService.authenticate(this.user).then(() => {
    	this.router.navigate(['home']);
    });
  }

}
