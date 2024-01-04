import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable()
export class AuthService {
  private currentUserSubject: BehaviorSubject<User> = new BehaviorSubject<User>(
    null
  );
  public currentUser: Observable<User>;
  public state: boolean;

  constructor(private apiService: ApiService, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser'))
    );

    this.currentUser = this.currentUserSubject.asObservable();

    // 1 - Get already saved user's informations
    const currentUserInfo: User = JSON.parse(
      localStorage.getItem('currentUser')
    );
    let token = currentUserInfo ? currentUserInfo.access_token : '';
    this.apiService.defaultConfig.headers.set('Authorization', token);

    // 2 - check if auth exist and if token validity
    this.apiService
      .get('/oauth/token/info')
      .then(() => {
        this.state = true;
        // 3 - Re introspect user, update user data
        this.introspect(
          localStorage.getItem('client_id'),
          localStorage.getItem('client_secret'),
          currentUserInfo.access_token.replace('Bearer ', '')
        )
          .then((userIntrospectedData: User) => {
            // Construct user
            const user: User = { ...userIntrospectedData };
            user.access_token = currentUserInfo.access_token;
            localStorage.setItem('currentUser', JSON.stringify(user));

            this.currentUserSubject.next(user);
            this.currentUserSubject.complete();
          })
          .catch(() => {
            this.logout();
          });
      })
      .catch(err => {
        // BACK TO HOME
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.currentUserSubject.complete();
        // 404 -> no authentication
        if (err.status == 404) {
          this.state = false; // Pas d'auth
        }
        // 401 -> Authentication raté
        if (err.status == 401) {
          this.router.navigate(['/']);
          this.state = true; // Auth present
        }
      });
  }

  /**
   * Get current user infos
   */
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   *
   */
  login(email, password) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    formData.append(
      'client_id',
      localStorage.getItem('client_id') ? localStorage.getItem('client_id') : ''
    );
    formData.append(
      'client_secret',
      localStorage.getItem('client_secret')
        ? localStorage.getItem('client_secret')
        : ''
    );

    return new Promise((resolve, reject) => {
      // 1 - Token request
      this.apiService
        .post('/oauth/token', formData)
        .then((response: any) => {
          if (response.access_token) {
            //2 - Introspect to get user information
            this.introspect(
              localStorage.getItem('client_id'),
              localStorage.getItem('client_secret'),
              response.access_token
            )
              .then((userIntrospectedData: User) => {
                // 3 - Save user
                const user: User = { ...userIntrospectedData };
                user.access_token = `Bearer ${response.access_token}`;
                localStorage.setItem('currentUser', JSON.stringify(user));
                // Save token in headers for next queries
                this.apiService.defaultConfig.headers.set(
                  'Authorization',
                  `${response.token_type} ${response.access_token}`
                );

                this.currentUserSubject.next(user);
                this.currentUserSubject.complete();
                resolve(response);
              })
              .catch(err => {
                this.logout();
                reject(err);
              });
          } else {
            this.logout();
            reject('No token');
          }
        })
        .catch((err: Error) => {
          this.logout();
          reject(err);
        });
    });
  }

  introspect(clientId, client_secret, token) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('client_id', clientId);
      formData.append('client_secret', client_secret);
      formData.append('token', token);
      this.apiService
        .post('/oauth/introspect', formData)
        .then((userInfos: User) => {
          if (userInfos.access_type) {
            resolve(userInfos);
          } else {
            reject({ status: 'incompatibility' });
          }
        })
        .catch(() => {
          reject('No introspect route');
        });
    });
  }

  /**
   *
   */
  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  updateAuth(newData) {
    const currentUser = {
      ...this.currentUserValue,
      ...newData
    };

    this.currentUserSubject.next(currentUser);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

  async checkUuid(uuid: string, reset = false): Promise<User> {
    return new Promise((resolve, reject) => {
      if (this.apiService && this.apiService.base) {
        this.apiService
          .get(`/users/unlock_access/${uuid}/${reset ? 'reset' : ''}`)
          .then((result: User) => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } else {
        reject();
      }
    });
  }

  async sendPassword(
    userId: number,
    password: string,
    confirmPassword: string,
    uuid: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('id', userId.toString());
    formData.append('password', password);
    formData.append('password_confirmation', confirmPassword);
    formData.append('uuid', uuid);

    return new Promise((resolve, reject) => {
      this.apiService
        .put('/users/change-password', formData)
        .then((result: any) => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  async reset(email: string): Promise<any> {
    const formData = new FormData();
    formData.append('email', email);
    return new Promise((resolve, reject) => {
      this.apiService
        .post('/users/password-forgotten', formData)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
