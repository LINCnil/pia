import { Injectable } from '@angular/core';
import { ApplicationDb } from '../application.db';

import { Revision } from '../models/revision.model';

import { PiaService } from './pia.service';


@Injectable()
export class RevisionService {

  private revisionDb: ApplicationDb;
  public currentVersion: Date;
  public revisionSelected: Revision;
  protected serverUrl: string;

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
        await this._piaService.replacePiaByExport(piaExport, true)
          .then(() => {
            if (this.serverUrl) { // TODO: CHECK IT

            } else {
              setTimeout(() => {
                location.reload();
              }, 2000);
            }
          });
      });
  }

  async getAll(piaId: number) {
    const items = [];
    return new Promise((resolve, reject) => {
      if (this.serverUrl) { // TODO: CHECK IT
        fetch(this.revisionDb.getServerUrl(), {
          mode: 'cors'
        }).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result);
        }).catch ((error) => {
          console.error('Request failed', error);
          reject();
        });
      } else {
        this.revisionDb.getObjectStore().then((response: IDBObjectStore) => {
          const index = response.index('index1').getAll(IDBKeyRange.only(piaId));
          index.onsuccess = (res: any) => {
            resolve(res.target.result);
          };
          index.onerror = (err) => {
            reject(err);
          };
        });
      }
    });
  }

  async add(piaExport, piaId) {
    return new Promise((resolve, reject) => {
      const revision = new Revision(piaExport, piaId, new Date());
      if (this.serverUrl) { // TODO: CHECK IT
        const formData = new FormData();
        for (const d in revision) {
          if (revision.hasOwnProperty(d)) {
            let value = revision[d];
            if (d === 'structure_data') {
              value = JSON.stringify(value);
            }
            formData.append('revision[' + d + ']', value);
          }
        }
        fetch(this.revisionDb.getServerUrl(), {
          method: 'POST',
          body: formData,
          mode : 'cors'
        }).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result.id);
        }).catch((error) => {
          console.error('Request failed', error);
          reject();
        });
      } else {
        this.revisionDb.getObjectStore().then((response: IDBObjectStore) => {
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
      }
    });
  }
}
