import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PermissionsService } from '@security/permissions.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from 'environments/environment';
import { User } from 'app/authentication/user.model';
import * as Moment from 'moment';

@Injectable()
export class AuthenticationService {
  private user = null;
  private profile;
  private readonly apiSettings = environment.api;
  private readonly dateFormat = environment.date_format;

  constructor(private http: HttpClient, private permissionsService: PermissionsService) {
    this.profile = new BehaviorSubject(null);
  }

  public authenticate(user: User) {
    const query = '?client_id=' + this.apiSettings.client_id +
      '&client_secret=' + this.apiSettings.client_secret +
      '&grant_type=password' +
      '&username=' + user.username +
      '&password=' + user.password
      ;

    return new Promise((resolve, reject) => {
      this.fetchToken(query).then(() => {
        this.fetchProfile().then(profile => {
          resolve(this.user);
        });
      });
    });
  }

  public isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('token');

    return new Promise((resolve, reject) => {
      if (!token) {
        resolve(false);
        return;
      }

      if (!this.user) {
        this.user = {
          'access_token': token,
          'refresh_token': localStorage.getItem('refresh'),
          'expires_at': localStorage.getItem('expiry')
        };
      }

      const expiry = Moment(this.user.expires_at, this.dateFormat);
      const remainder = Moment.duration(expiry.diff(Moment())).as('seconds');

      if (!remainder || remainder <= 10) {
         resolve(false);
         return;
      }

      if (remainder < 300) {
        this.refreshToken();
      }

      if (this.profile.value !== null) {
        resolve(true);
        return;
      }

      this.fetchProfile().then(() => {
        resolve(true);
      });
    });
  }

  public getProfile() {
    return this.profile;
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
        err => {
          console.error(err);
          reject();
        },
        () => { resolve(this.user); }
      );
    });
  }

  protected fetchProfile() {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiSettings.host + '/profile').subscribe(
        profile => {
          this.profile.next(profile);
          this.permissionsService.activeCurrentRole(this.profile.value.pia_roles.pop());
        },
        err => {
          console.error(err);
          reject();
        },
        () => { resolve(this.profile); }
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

    this.user.expires_at = expiry.seconds(expiry.seconds() + this.user.expires_in)
      .format(this.dateFormat)
      ;
  }

}
