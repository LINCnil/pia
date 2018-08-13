import { Timestampable } from './timestampable.model'
import * as Moment from 'moment';

export class BaseModel implements Timestampable {

  public id: any;
  public created_at: Date;
  public updated_at: Date;

  public fromJson(json: any): this {
    if (typeof json === 'string') {
      return this.fromJson(JSON.parse(json));
    } else {
      return Object.assign(this, json, this.mapFromJson(json));
    }
  }

  protected mapToJson(object?: any): any {
    return this.iterate(object);
  }

  public toJson(): any {
    return Object.assign({}, this, this.mapToJson(this));
  }

  protected iterate(obj) {

    for (const property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (obj[property] instanceof Date) {
          obj[property] = Moment(obj[property]).format()
        } else if (typeof obj[property] === 'object') {
          this.iterate(obj[property]);
        }
      }
    }
    return obj;
  }

  protected mapFromJson(json: any): any {
    return {
      created_at: json.created_at ? Moment(json.created_at).toDate() : null,
      updated_at: json.updated_at ? Moment(json.updated_at).toDate() : null
    }
  }

  // public toJson(): any {
  //   return Object.assign({}, this, this.mapToJson());
  // }

  public toJsonString(): string {
    return JSON.stringify(this.toJson());
  }

  // protected mapToJson(): any {
  //   return {
  //     created_at: this.created_at ? Moment(this.created_at).format() : null,
  //     updated_at: this.updated_at ? Moment(this.updated_at).format() : null
  //   }
  // }
}
