
import { BaseService } from '@api/service/base.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { FolderModel } from '@api/models';
import { Injectable } from '@angular/core';
import { ProcessingModel } from '@api/models';

@Injectable()
export class FolderService extends BaseService<FolderModel> {

  protected modelClass = FolderModel;

  protected routing: any = {
    all: '/structures/{structureId}/folders',
    one: '/structures/{structureId}/folders/{id}'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(structureId:string): Observable<FolderModel[]> {
    return this.httpGetAll(this.routing.all,{structureId: structureId}).map(folders => {
      folders.forEach(folder => {
        folder.processings.forEach((processing, index, processings) => {
          processings[index] = (new ProcessingModel()).fromJson(processing);
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

  public get(structureId:string, id: any): Observable<FolderModel> {
    return this.httpGetOne(this.routing.one, {structureId: structureId, id: id }).map(folder => {
      folder.processings.forEach((processing, index, processings) => {
        processings[index] = (new ProcessingModel()).fromJson(processing);
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
    return this.httpPut(this.routing.one, {structureId: model.structure_id, id: model.id }, model);
  }

  public create(model: FolderModel): Observable<FolderModel> {
    return this.httpPost(this.routing.all, {structureId: model.structure_id}, model);
  }

  public deleteById(structureId:any, id: any): Observable<FolderModel> {
    return this.httpDelete(this.routing.one, {structureId: structureId, id: id });
  }

  public delete(model: FolderModel): Observable<FolderModel> {
    return this.deleteById(model.structure_id, model.id);
  }
}
