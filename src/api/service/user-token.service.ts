import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BaseService } from '@api/service/base.service';
import { UserToken } from '@api/model/user-token.model';
import { environment } from 'environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class UserTokenService extends BaseService<UserToken> {

  protected modelClass = UserToken;

  protected routing: any = {
    token: environment.api.token_path,
  };

  protected httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded'
    })
  };

  public getTokenFromLogin(username, password): Observable<UserToken> {
    const query = this.buildQuery({
      client_id: environment.api.client_id,
      client_secret: environment.api.client_secret,
      grant_type: 'password',
      username: username,
      password: password
    });

    return this.http.post(this.buildRoute(this.routing.token), query, this.httpOptions).map(res => this.mapToModel(res, this.modelClass));
  }

  public refreshToken(token: UserToken): Observable<UserToken> {
    const query = this.buildQuery({
      client_id: environment.api.client_id,
      client_secret: environment.api.client_secret,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token
    });

    return this.http.post(this.buildRoute(this.routing.token), query, this.httpOptions).map(res => this.mapToModel(res, this.modelClass));
  }

}
