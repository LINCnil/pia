import { Timestampable } from '@api/model/timestampable.model'

export class BaseModel implements Timestampable {

  public id: any;
  public created_at: Date;
  public updated_at: Date;

  public fromJson(json: any): this {
    if (typeof json === 'string') {
      return this.fromJson(JSON.parse(json));
    } else {
      return Object.assign(this, json, {
        created_at: new Date(json.created_at),
        updated_at: new Date(json.updated_at),
      });
    }
  }

  public toJson(): any {
    return Object.assign({}, this, {
      created_at: this.created_at.toString(),
      updated_at: this.updated_at.toString()
    });
  }
}
