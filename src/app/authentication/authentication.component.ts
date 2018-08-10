import { Component, OnInit } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from '@security/authentication.service';
import { User } from '@security/user.model';
import { environment } from 'environments/environment';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  animations: [
    trigger('errorState', [
      state('inactive', style({
        opacity: 0
      })),
      state('active', style({
        opacity: 1
      })),
      transition('inactive => active', animate('300ms ease-in')),
      transition('active => inactive', animate('300ms ease-out'))
    ])
  ]
})
export class AuthenticationComponent implements OnInit {
  public user = new User('', '');
  public error = false;
  public backendUrl = '#'

  constructor(public authService: AuthenticationService, public router: Router) {
    this.backendUrl = environment.api.host + '/resetting/request'
  }

  onSubmit() {
    this.error = false
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
