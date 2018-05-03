import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from 'app/authentication/user.model';

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

    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8000/oauth/v2/token' + query).subscribe(
        data => {
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
    localStorage.removeItem('token');
  }

}
