import { Injectable } from '@angular/core';

import { Revision } from '../models/revision.model';
import { PiaService } from './pia.service';

@Injectable()
export class RevisionService {
  public revisionSelected: number;

  constructor(public piaService: PiaService) {}

  /**
   * Load a new revision
   */
  async loadRevision() {
    const revision = new Revision();
    revision.pia_id = this.piaService.pia.id;
    revision.get(this.revisionSelected).then(() => {
      const piaExport = JSON.parse(revision.export);
      this.piaService.replacePiaByExport(piaExport, true).then(() => {
        location.reload();
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
}
