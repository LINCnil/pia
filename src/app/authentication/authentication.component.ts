import { Component, OnInit } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages.service';
import { AuthenticationService } from 'app/services/authentication.service';
import { User } from 'app/authentication/user.model';
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
      user => {
      	if (user === undefined) {
      		this.error = true;

      		return;
      	}

      	this.router.navigate(['home']);
      },
      () => {
        this.error = true
      }
    );
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['home']);
    }
  }

}
