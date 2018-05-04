import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { User } from 'app/authentication/user.model';
import * as Moment from 'moment';

@Injectable()
export class AuthenticationService {
  private user = null;
  private readonly apiSettings = environment.api;

  constructor(private http: HttpClient) {}

  public authenticate(user: User) {
    const query = '?client_id=' + this.apiSettings.client_id +
                '&client_secret=' + this.apiSettings.client_secret +
                '&grant_type=password' +
                '&username=' + user.username +
                '&password=' + user.password
    ;

    return this.fetchToken(query);
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');

    if (!this.user) {
      if (!token) {
        return false;
      }

      this.user = {
        'access_token': token,
        'refresh_token': localStorage.getItem('refresh'),
        'expires_at': localStorage.getItem('expiry')
      }
    }

    const expiry = Moment(this.user.expires_at, 'DD MMMM, YYYY HH:mm');
    const remainder = Moment.duration(expiry.diff(Moment())).as('seconds');

    if (!remainder || remainder <= 10) {
      return false;
    }

    if (remainder < 300) {
      this.refreshToken();
    }

    return true;
  }

  public getProfile() {
    return this.user;
  }

  public logout() {
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('expiry');
    localStorage.removeItem('refresh');
  }

  protected fetchToken(query: string) {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiSettings.host + this.apiSettings.token_path + query).subscribe(
        data => {
          this.user = data;
          this.setExpiryDate();

          localStorage.setItem('token', this.user.access_token);
          localStorage.setItem('refresh', this.user.refresh_token);
          localStorage.setItem('expiry', this.user.expires_at);
        },
        err  => {
          console.error(err);
          reject();
        },
        ()   => { resolve(this.user); }
      );
    });
  }

  protected refreshToken() {
    const query = '?client_id=' + this.apiSettings.client_id +
                '&client_secret=' + this.apiSettings.client_secret +
                '&grant_type=refresh_token' +
                '&refresh_token=' + this.user.refresh_token
    ;

    return this.fetchToken(query);
  }

  protected setExpiryDate() {
    const expiry = Moment();

    this.user.expires_at = expiry.seconds(expiry.seconds() + this.user.expires_in);
  }

}
