import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from 'environments/environment';
import { User } from '@security/user.model';
import { PermissionsService } from '@security/permissions.service';
import { UserProfileApi, UserTokenApi } from '@api/services';
import { UserProfileModel, UserTokenModel } from '@api/models';
import * as Moment from 'moment';

@Injectable()
export class AuthenticationService {
  private userToken: UserTokenModel = null;
  public profileSubject: BehaviorSubject<UserProfileModel> = new BehaviorSubject<UserProfileModel>(null)
  private readonly apiSettings: any = environment.api;
  private readonly dateFormat: string = environment.date_format;

  constructor(
    private http: HttpClient,
    private permissionsService: PermissionsService,
    private userProfileApi: UserProfileApi,
    private userTokenApi: UserTokenApi
  ) {
  }

  public authenticate(user: User): Promise<UserTokenModel> {

    return this.userTokenApi.getTokenFromLogin(user.username, user.password)
      .map((userToken: UserTokenModel) => {
        UserTokenModel.setLocalToken(userToken);
        this.userToken = userToken;
        this.fetchProfile();
        return userToken;
      }).toPromise();
  }

  public isAuthenticated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!UserTokenModel.hasLocalToken()) {
        resolve(false);
        return;
      }

      if (!this.userToken) {
        this.userToken = UserTokenModel.getLocalToken();
      }

      if (this.userToken.isExpired()) {
        resolve(false);
        return;
      }

      if (this.userToken.willExpireIn(300)) {
        this.refreshToken();
      }

      if (this.profileSubject.getValue() !== null) {
        resolve(true);
        return;
      }

      this.fetchProfile().then(() => {
        resolve(true);
      });
    });
  }

  public logout() {
    this.userToken = null;
    localStorage.removeItem('token');
  }

  protected fetchProfile(): Promise<UserProfileModel> {
    return new Promise((resolve, reject) => {
      this.userProfileApi.get().subscribe(
        (profile: UserProfileModel) => {
          this.profileSubject.next(profile);
          this.permissionsService.activateCurrentRoles(profile.roles);
        },
        (err) => {
          console.error(err);
          reject();
        },
        () => { resolve(this.profileSubject.getValue()); }
      );
    });
  }

  protected refreshToken() {

    return this.userTokenApi.refreshToken(this.userToken)
      .map((userToken: UserTokenModel) => {
        localStorage.setItem('token', userToken.toJsonString());
        this.userToken = userToken;
      }).toPromise();
  }

}
