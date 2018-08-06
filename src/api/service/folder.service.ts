
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Folder, Processing } from '../model';

@Injectable()
export class FolderService extends BaseService<Folder> {

  protected modelClass = Folder;

  protected routing: any = {
    all: '/structures/{structureId}/folders',
    one: '/structures/{structureId}/folders/{id}'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(structureId:string): Observable<Folder[]> {
    return this.httpGetAll(this.routing.all,{structureId: structureId}).map(folders => {
      folders.forEach(folder => {
        folder.processings.forEach((processing, index, processings) => {
          processings[index] = (new Processing()).fromJson(processing);
        });
        folder.children.forEach((child, index, children) => {
          children[index] = (new Folder()).fromJson(child);
        });
        if (folder.parent !== null) {
          folder.parent = (new Folder()).fromJson(folder.parent)
        }
      });
      return folders;
   });
  }

  public get(structureId:string, id: any): Observable<Folder> {
    return this.httpGetOne(this.routing.one, {structureId: structureId, id: id }).map(folder => {
      folder.processings.forEach((processing, index, processings) => {
        processings[index] = (new Processing()).fromJson(processing);
      });
      folder.children.forEach((child, index, children) => {
        children[index] = (new Folder()).fromJson(child);
      });
      if (folder.parent !== null) {
        folder.parent = (new Folder()).fromJson(folder.parent)
      }
      return folder;
    });
  }

  public update(model: Folder): Observable<Folder> {
    return this.httpPut(this.routing.one, {structureId: model.structure_id, id: model.id }, model);
  }

  public create(model: Folder): Observable<Folder> {
    return this.httpPost(this.routing.all, {structureId: model.structure_id}, model);
  }

  public deleteById(structureId:any, id: any): Observable<Folder> {
    return this.httpDelete(this.routing.one, {structureId: structureId, id: id });
  }

  public delete(model: Folder): Observable<Folder> {
    return this.deleteById(model.structure_id, model.id);
  }
}
