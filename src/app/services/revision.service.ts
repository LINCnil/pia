import { Injectable } from '@angular/core';

import { PiaService } from './pia.service';
import { Router } from '@angular/router';
import { Revision } from '../models/revision.model';
import { ApplicationDb } from '../application.db';
import { ApiService } from './api.service';

@Injectable()
export class RevisionService extends ApplicationDb {
  public revisionSelected: number;

  constructor(
    public piaService: PiaService,
    protected apiService: ApiService,
    private router: Router
  ) {
    super(201911191636, 'revision');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  /**
   * List all revisions
   * @param piaId - The PIA id
   */
  async findAllByPia(piaId: number): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      super
        .findAll(null, { index: 'index1', value: piaId })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject();
        });
    });
  }

  /**
   * Get a Revision.
   * @param id - The Revision id.
   * @returns - New Promise
   */
  async get(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      super
        .find(id)
        .then((entry: any) => {
          if (entry) {
            this.export = entry.export;
            this.created_at = new Date(entry.created_at);
          }
          resolve(entry);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Create a new Structure.
   * @returns - New Promise
   */
  async create(revision): Promise<any> {
    const data = {
      ...revision,
      created_at: new Date()
    };
    return new Promise((resolve, reject) => {
      super
        .create(data, 'revision')
        .then((result: any) => {
          resolve({ ...result, id: result.id });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Load a new revision
   */
  async loadRevision(revisionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      super.find(revisionId).then((revision: Revision) => {
        const piaExport = JSON.parse(revision.export);
        this.piaService
          .replacePiaByExport(piaExport, true, true, revision.created_at)
          .then(() => {
            resolve(piaExport);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  /**
   * Create new revision
   * @param piaExport - The PIA exported
   * @param piaId - The PIA id
   */
  async add(piaExport, piaId): Promise<any> {
    return new Promise((resolve, reject) => {
      const revision = new Revision();
      revision.pia_id = piaId;
      revision.export = piaExport;
      this.create(revision)
        .then((response: any) => {
          resolve(response);
        })
        .catch(err => reject(err));
    });
  }

  async export(id: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.piaService.calculPiaProgress;
      this.piaService.exportData(id).then(data => {
        const finalData = JSON.stringify(data);
        resolve(finalData);
      });
    });
  }

  /**
   * Get the status of the PIA.
   * @returns - Locale for translation.
   */
  getStatusName(status): string {
    if (status >= 0) {
      return `pia.statuses.${status}`;
    }
  }

  /**
   * Get gauge name.
   * @param value - The gauge value.
   */
  getGaugeName(value: any): string {
    if (value) {
      return `summary.gauges.${value}`;
    }
  }
}
