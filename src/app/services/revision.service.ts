import { Injectable } from '@angular/core';
import { ApplicationDb } from '../application.db';
import { Pia } from '../entry/pia.model';
import { Revision } from '../models/revision.model';

@Injectable()
export class RevisionService {
  private revisionDb: ApplicationDb;
  constructor() {
    this.revisionDb = new ApplicationDb(201911191636, 'revision');
  }

  async getAll(piaId: number) {
    const items = [];
    return new Promise((resolve, reject) => {
      this.revisionDb.getObjectStore().then((response: IDBObjectStore) => {
          const index1 = response.index('index1');
          const evt = index1.openCursor(IDBKeyRange.only(piaId));
          evt.onsuccess = (res: any) => {
            resolve(res.target.result);
          };
          evt.onerror = (err) => {
            reject(err);
          };
        });
    });
  }

  async add(pia: Pia) {
    return new Promise((resolve, reject) => {
      this.revisionDb.getObjectStore().then((response: IDBObjectStore) => {

          const revision = new Revision(
            null,
            new Date(),
            pia,
            pia.id
          );

          const evt = response.add(revision);

          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = (event: any) => {
            resolve(event.target.result);
          };

        });
    });
  }
}
