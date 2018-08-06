import { BaseModel } from './base.model';
import * as Moment from 'moment';
import { environment } from 'environments/environment';

export class UserToken extends BaseModel {
  public access_token: string;
  public refresh_token: string;
  public expires_at: Date;
  public expires_in: number;
  public token_type: string;
  public scope: any;

  public isExpired(): boolean {
    const expiry = Moment(this.expires_at, environment.date_format);
    const remainder = Moment.duration(expiry.diff(Moment())).as('seconds');
    return (!remainder || remainder <= 10);
  }

  public willExpireIn(msec: number): boolean {
    const expiry = Moment(this.expires_at, environment.date_format);
    const remainder = Moment.duration(expiry.diff(Moment())).as('seconds');
    return (remainder > 10 && remainder <= msec);
  }


  public static setLocalToken(token: UserToken) {
    localStorage.setItem('token', token.toJsonString());
  }

  public static getLocalToken(): UserToken {
    const token = localStorage.getItem('token');
    return (new UserToken()).fromJson(token);
  }

  public static hasLocalToken(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    try {
      (new UserToken()).fromJson(token);
      return true;
    } catch (err) {
      this.removeLocalToken();
      console.error('Invalid local token format: local token removed');
      return false;
    }
  }

  public static removeLocalToken(): void {
    localStorage.removeItem('token');
  }

  public mapFromJson(json: any): any {
    const expiry = Moment();
    return Object.assign({}, super.mapFromJson(json), {
      expires_at: json.expires_at ? json.expires_at : expiry.seconds(expiry.seconds() + json.expires_in).toDate()
    });
  }

  public mapToJson(): any {
    return Object.assign({}, super.mapToJson(), {
      expires_at: this.expires_at ? Moment(this.expires_at).format(environment.date_format) : Moment().format(environment.date_format)
    });
  }
}
