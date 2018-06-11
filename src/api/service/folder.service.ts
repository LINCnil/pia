
import { BaseService } from '@api/service/base.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { FolderModel } from '@api/models';
import { Injectable } from '@angular/core';
import { PiaModel } from '@api/models';

@Injectable()
export class FolderService extends BaseService<FolderModel> {

  protected modelClass = FolderModel;

  protected routing: any = {
    all: '/folders',
    one: '/folders/{id}'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(): Observable<FolderModel[]> {
    return this.httpGetAll(this.routing.all).map(folders => {
      folders.forEach(folder => {
        folder.pias.forEach((pia, index, pias) => {
          pias[index] = (new PiaModel()).fromJson(pia);
        });
        folder.children.forEach((child, index, children) => {
          children[index] = (new FolderModel()).fromJson(child);
        });
        if (folder.parent !== null) {
          folder.parent = (new FolderModel()).fromJson(folder.parent)
        }
      });
      return folders;
   });
  }

  public get(id: any): Observable<FolderModel> {
    return this.httpGetOne(this.routing.one, { id: id }).map(folder => {
      folder.pias.forEach((pia, index, pias) => {
        pias[index] = (new PiaModel()).fromJson(pia);
      });
      folder.children.forEach((child, index, children) => {
        children[index] = (new FolderModel()).fromJson(child);
      });
      if (folder.parent !== null) {
        folder.parent = (new FolderModel()).fromJson(folder.parent)
      }
      return folder;
    });
  }

  public update(model: FolderModel): Observable<FolderModel> {
    return this.httpPut(this.routing.one, { id: model.id }, model);
  }

  public create(model: FolderModel): Observable<FolderModel> {
    return this.httpPost(this.routing.all, {}, model);
  }

  public deleteById(id: any): Observable<FolderModel> {
    return this.httpDelete(this.routing.one, { id: id });
  }

  public delete(model: FolderModel): Observable<FolderModel> {
    return this.deleteById(model.id);
  }
}
