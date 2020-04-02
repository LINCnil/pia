import { Injectable } from '@angular/core';

import { Revision } from '../models/revision.model';
import { PiaService } from './pia.service';
import { Router } from '@angular/router';
import { utf8Encode } from '@angular/compiler/src/util';

@Injectable()
export class RevisionService {
  public revisionSelected: number;

  constructor(public piaService: PiaService, private router: Router) {}

  /**
   * Load a new revision
   */
  async loadRevision() {
    return new Promise(resolve => {
      const revision = new Revision();
      revision.pia_id = this.piaService.pia.id;
      revision.get(this.revisionSelected).then(() => {
        console.log('revision', revision);
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
