import { Injectable } from '@angular/core';

import { PiaService } from './pia.service';
import { Router } from '@angular/router';
import { utf8Encode } from '@angular/compiler/src/util';
import { Revision } from '../models/revision.model';
import { ApplicationDb } from '../application.db';

@Injectable()
export class RevisionService extends ApplicationDb {
  public revisionSelected: number;

  constructor(public piaService: PiaService, private router: Router) {
    super(201911191636, 'revision');
  }

  /**
   * Load a new revision
   */
  async loadRevision() {
    return new Promise(resolve => {
      const revision = new Revision();
      revision.pia_id = this.piaService.pia.id;
      revision.get(this.revisionSelected).then(() => {
        const piaExport = JSON.parse(revision.export);
        this.piaService.replacePiaByExport(piaExport, true, true, revision.created_at).then(() => {
          this.router.navigate(['entry', this.piaService.pia.id]);
          resolve();
        });
      });
    });
  }

  /**
   * Load a new revision
   */
  async getRevisionById(id) {
    return new Promise(resolve => {
      const revision = new Revision();
      revision.pia_id = this.piaService.pia.id;
      revision.get(this.revisionSelected).then(() => {
        const piaExport = JSON.parse(revision.export);
        resolve(piaExport);
      });
    });
  }

  /**
   * Create new revision
   * @param piaExport - The PIA exported
   * @param piaId - The PIA id
   */
  async add(piaExport, piaId) {
    return new Promise((resolve, reject) => {
      const revision = new Revision();
      revision.pia_id = piaId;
      revision.export = piaExport;
      revision.create().then((response: any) => {
        this.piaService.pia.updated_at = new Date(); // Update current version's date
        // BETTER SOLUTION BUT REFRESH SCREEN:
        // this.router.navigate(['entry', this.piaService.pia.id]);
        resolve(response);
      });
    });
  }

  /**
   * Prepare to load a revision
   * @param revisionId - The revision id
   * @param piaId - The PIA id
   */
  async prepareLoadRevision(revisionId: number, piaId: number) {
    this.revisionSelected = revisionId;
    localStorage.setItem('revision-date-id', revisionId.toString());
    return new Promise(resolve => {
      const revision = new Revision();
      revision.pia_id = piaId;
      revision.get(revisionId).then(() => {
        resolve(revision.created_at);
      });
    });
  }

  async export(id: number) {
    return new Promise(async (resolve, reject) => {
      this.piaService.calculPiaProgress;
      this.piaService.exportData(id).then(data => {
        const finalData = JSON.stringify(data);
        resolve(finalData);
      });
    });
  }
}
