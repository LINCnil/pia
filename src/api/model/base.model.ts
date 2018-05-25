import { Timestampable } from '@api/model/timestampable.model'
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

  protected mapFromJson(json:any):any{
    return {
      created_at: json.created_at ? Moment(json.created_at).toDate():null,
      updated_at: json.updated_at ? Moment(json.updated_at).toDate():null
    }
  }

  public toJson(): any {
    return Object.assign({}, this, this.mapToJson());
  }

  public toJsonString(): string {
    return JSON.stringify(this.toJson());
  }

  protected mapToJson():any{
    return {
      created_at: this.created_at ? Moment(this.created_at).format() : null,
      updated_at: this.updated_at ? Moment(this.updated_at).format() : null
    }
  }
}
