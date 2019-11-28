import { Injectable } from '@angular/core';
import { ApplicationDb } from '../application.db';

import { Revision } from '../models/revision.model';

import { PiaService } from './pia.service';


@Injectable()
export class RevisionService {

  private revisionDb: ApplicationDb;
  public currentVersion: Date;
  public revisionSelected: Revision;
  constructor(public _piaService: PiaService) {
    this.revisionDb = new ApplicationDb(201911191636, 'revision');
  }

  prepareRevision(id) {
    this.revisionSelected = id;
  }

  async loadRevision() {
    this.revisionDb.find(this.revisionSelected)
      .then(async (response: Revision) => {
        const piaExport = JSON.parse(response.export);
        await this._piaService.replacePiaByExport(piaExport)
          .then(() => {
            console.log('reload');
            setTimeout(() => {
              location.reload();
            }, 2000);
          });
      });
  }

  async getAll(piaId: number) {
    return new Promise((resolve, reject) => {
      this.revisionDb.getObjectStore().then((response: IDBObjectStore) => {
          const index = response.index('index1').getAll(IDBKeyRange.only(piaId));
          index.onsuccess = (res: any) => {
            resolve(res.target.result);
          };
          index.onerror = (err) => {
            reject(err);
          };
        });
    });
  }

  async add(piaExport, piaId) {
    return new Promise((resolve, reject) => {
      this.revisionDb.getObjectStore().then((response: IDBObjectStore) => {

          let revision = new Revision(piaExport, piaId, new Date());

          const evt = response.add(revision);

          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            resolve(
              {...revision,
              id: event.target.result}
            );
          };

        });
    });
  }
}
