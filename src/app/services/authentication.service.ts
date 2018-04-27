import { Injectable } from '@angular/core';
import { UserManager, UserManagerSettings, User } from 'oidc-client';
//import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthenticationService {
  private manager = new UserManager(getClientSettings());
  private user: User = null;

  constructor() {
    this.manager.getUser().then(user => {
        this.user = user;
    });
  } 

  public isAuthenticated(): boolean {
  	//const jwtHelper = new JwtHelperService();
    const token = localStorage.getItem('token');

    //return !jwtHelper.isTokenExpired(token);
    return false;
  }

  public isLoggedIn(): boolean {
    return this.user != null && !this.user.expired;
	}

	public getProfile(): any {
    return this.user.profile;
	}

	public getAuthorizationHeaderValue(): string {
    return `${this.user.token_type} ${this.user.access_token}`;
	}

	public startAuthentication(): Promise<void> {
    return this.manager.signinRedirect();
	}

	public completeAuthentication(): Promise<void> {
    return this.manager.signinRedirectCallback().then(user => {
        this.user = user;
    });
	}

}

export function getClientSettings(): UserManagerSettings {
  return {
    authority: 'https://samples.auth0.com/authorize',
    client_id: 'kbyuFDidLLm280LIwVFiazOqjO3ty8KH',
    redirect_uri: 'http://localhost:4200/auth-callback',
    post_logout_redirect_uri: 'http://localhost:4200/',
    response_type:"id_token token",
    scope:"openid profile api1",
    filterProtocolClaims: true,
    loadUserInfo: true
  };
}