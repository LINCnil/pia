import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from 'app/authentication/user.model';
//import { UserManager, UserManagerSettings, User } from 'oidc-client';

@Injectable()
export class AuthenticationService {
  // private manager = new UserManager({
  //   authority: 'https://samples.auth0.com/authorize',
  //   client_id: 'kbyuFDidLLm280LIwVFiazOqjO3ty8KH',
  //   redirect_uri: 'http://localhost:4200/auth-callback',
  //   post_logout_redirect_uri: 'http://localhost:4200/',
  //   response_type:"id_token token",
  //   scope:"openid profile api1",
  //   filterProtocolClaims: true,
  //   loadUserInfo: true
  // });

  private user: User = null;

  constructor(private http: HttpClient) {
    // this.manager.getUser().then(user => {
    //     this.user = user;
    // });
  }

  public authenticate(user: User) {
    var query = '?username=' + user.username + '&password=' + user.password;

    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:3001/users' + query).subscribe(
        data => {
          this.user = data[0];
        },
        err  => { console.error(err); },
        ()   => { resolve(this.user); }
      );
    });
  }

  public isAuthenticated(): boolean {
    return this.user !== undefined && this.user !== null;
  }

  public getProfile() {
    return this.user;
  }

 //  public isAuthenticated(): boolean {
 //  	return this.user != null && !this.user.expired;
 //  }

	// public getProfile(): any {
 //    return this.user.profile;
	// }

	// public getAuthorizationHeaderValue(): string {
 //    return `${this.user.token_type} ${this.user.access_token}`;
	// }

	// public startAuthentication(): Promise<void> {
 //    //return this.manager.signinRedirect();
 //    return this.completeAuthentication();
	// }

	// public completeAuthentication(): Promise<void> {
 //    return this.manager.signinRedirectCallback().then(user => {
 //        this.user = user;
 //    });
	// }

}