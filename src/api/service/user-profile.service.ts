import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { UserProfile } from '../model';

@Injectable()
export class UserProfileService extends BaseService<UserProfile> {

  protected modelClass = UserProfile;

  protected routing: any = {
    one: '/profile',
  };

  constructor(http: HttpClient) {
    super(http);
  }


  public get(): Observable<UserProfile> {
    return this.httpGetOne(this.routing.one);
  }


}
