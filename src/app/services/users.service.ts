import { Injectable } from '@angular/core';

import { Pia } from '../models/pia.model';
import { User } from '../models/user.model';

import { AuthService } from './auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ApplicationDb } from '../application.db';
import { ApiService } from './api.service';

@Injectable()
export class UsersService extends ApplicationDb {
  constructor(
    private authService: AuthService,
    private translateService: TranslateService,
    protected apiService: ApiService,
    private router: Router
  ) {
    super(201911191636, 'user');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  getUsers(): Promise<Array<User>> {
    return new Promise((resolve, reject) => {
      super
        .findAll()
        .then((response: User[]) => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  editUser(id: number, user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      if (id) {
        super
          .update(id, user, 'user')
          .then((response: User) => {
            resolve(response);
          })
          .catch(err => {
            reject(err);
          });
      } else {
        super
          .create(user, 'user')
          .then((response: User) => {
            resolve(response);
          })
          .catch(err => {
            reject(err);
          });
      }
    });
  }

  preventDeleteUser(userId: number): Promise<boolean | Error> {
    return new Promise(async (resolve, reject) => {
      // Get data
      const usersList: User[] = await this.getUsers();
      const userPias: Pia[] = await this.getUserPias(userId);
      const authUser: User = this.authService.currentUserValue;

      // Check if the current user doesn't try to delete himself from the database
      if (userId !== authUser.id) {
        if (usersList) {
          // Check if user don't delete all technical Administrator
          if (
            usersList.filter(
              u => u.access_type.includes('technical') && u.id !== userId
            ).length >= 1
          ) {
            // Check pias presence
            if (userPias && userPias.length <= 0) {
              resolve(true);
            } else {
              reject(
                new Error(
                  this.translateService.instant(
                    'users.remove_user_with_linked_pias_error_message'
                  )
                )
              );
            }
          } else {
            reject(
              new Error(
                this.translateService.instant(
                  'users.remove_last_functional_admin_error_message'
                )
              )
            );
          }
        }
      } else {
        reject(
          new Error(
            this.translateService.instant(
              'users.remove_current_user_error_message'
            )
          )
        );
      }
    });
  }

  /**
   * Delete user
   */
  deleteUser(userId: number): Promise<User> {
    return new Promise((resolve, reject) => {
      super
        .delete(userId)
        .then((response: User) => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Find pia by userId
   */
  getUserPias(userId: number): Promise<Pia[] | any> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([]);
      }, 1000);
    });
  }
}
