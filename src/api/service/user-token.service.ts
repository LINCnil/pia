import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '@api/service/base.service';
import { UserToken } from '@api/model/user-token.model';
import { environment } from 'environments/environment';

@Injectable()
export class UserTokenService extends BaseService<UserToken> {

  protected modelClass = UserToken;

  protected routing: any = {
    token: environment.api.token_path,
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getTokenFromLogin(username, password): Observable<UserToken> {
    return this.httpGetOne(this.routing.token, {}, {
      client_id: environment.api.client_id,
      client_secret: environment.api.client_secret,
      grant_type: 'password',
      username: username,
      password: password
    });
  }

  public refreshToken(token: UserToken): Observable<UserToken> {
    return this.httpGetOne(this.routing.token, {}, {
      client_id: environment.api.client_id,
      client_secret: environment.api.client_secret,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token
    });
  }


}
