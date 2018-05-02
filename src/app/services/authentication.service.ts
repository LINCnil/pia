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

  private user = null;
  private readonly clientId = '1_qx9fur5ljc0gs8g8sooc04w8ckokw80048w4k0sw8ww4cwckc'; 
  private readonly clientSecret = '2ymtnacjy740880ssogco8kggcssgw0os0048kgww0sc08owkw';

  constructor(private http: HttpClient) {
    // this.manager.getUser().then(user => {
    //     this.user = user;
    // });
  }

  public authenticate(user: User) {
    var query = '?client_id=' + this.clientId + 
                '&client_secret=' + this.clientSecret +
                '&grant_type=password' +
                '&username=' + user.username +
                '&password=' + user.password
    ;

    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8000/oauth/v2/token' + query).subscribe(
        data => {
          console.log(data);
          this.user = data;
          localStorage.setItem('token', this.getToken());
        },
        err  => { 
          console.error(err);
          reject(); 
        },
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

  public getToken() {
    return this.user.access_token;
  }

  public logout() {
    this.user = null;
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