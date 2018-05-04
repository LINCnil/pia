import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from 'app/authentication/user.model';
import * as Moment from 'moment';

@Injectable()
export class AuthenticationService {
  private user = null;
  // test values
  private readonly clientId = '4_3w5oauyhyosggw00kwggc444s4wwk0o4sgg0k4c4wks8kg0cc0';
  private readonly clientSecret = '25jw4beivse88soc84os0o44ssgc0gsgcoosgokw0kwkkokckg';

  constructor(private http: HttpClient) {}

  public authenticate(user: User) {
    const query = '?client_id=' + this.clientId +
                '&client_secret=' + this.clientSecret +
                '&grant_type=password' +
                '&username=' + user.username +
                '&password=' + user.password
    ;

    return this.fetchToken(query);
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');

    if(!this.user) {
      if(!token) {
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

    if(remainder <= 10) {
      return false;
    }

    if(remainder < 300) {
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
      this.http.get('http://localhost:8000/oauth/v2/token' + query).subscribe(
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
    const query = '?client_id=' + this.clientId +
                '&client_secret=' + this.clientSecret +
                '&grant_type=refresh_token' +
                '&refresh_token=' + this.user.refresh_token
    ;

    return this.fetchToken(query);
  }

  protected isTokenExpired(): boolean {
    let now = new Date();
    
    return false;
  }

  protected setExpiryDate() {
    let expiry = Moment();

    this.user.expires_at = expiry.seconds(expiry.seconds() + this.user.expires_in);
  }

}
