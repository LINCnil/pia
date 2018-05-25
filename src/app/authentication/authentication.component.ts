import { Component, OnInit } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages.service';
import { AuthenticationService } from '@security/authentication.service';
import { User } from '@security/user.model';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
  public user = new User('', '');
  public error = false;
  public backendUrl = '#'

  constructor(public authService: AuthenticationService, public router: Router) {
    this.backendUrl = environment.api.host + '/resetting/request'
  }

  onSubmit() {
    this.authService.authenticate(this.user).then(
      (userToken) => {
        if (userToken === undefined) {
          this.error = true;
          return;
        }

        this.router.navigate(['home']);
      },
      (err) => {
        this.error = true
      }
    );
  }

  ngOnInit() {
    this.authService.isAuthenticated().then((isAuth: boolean) => {
      if (isAuth) {
        this.router.navigate(['home']);
      }
    });
  }

}
