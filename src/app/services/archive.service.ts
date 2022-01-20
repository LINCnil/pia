import { Injectable } from '@angular/core';

import { AppDataService } from 'src/app/services/app-data.service';
import { Pia } from '../models/pia.model';
import { PiaService } from './pia.service';
import { SidStatusService } from './sid-status.service';

@Injectable()
export class ArchiveService {
  archivedPias = [];
  data: { sections: any };

  constructor(
    private piaService: PiaService,
    public appDataService: AppDataService,
    public sidStatusService: SidStatusService
  ) {
    this.data = this.appDataService.dataNav;
  }

  // UPDATE
  remove(id): Promise<void> {
    return new Promise((resolve, reject) => {
      // Removes from DB
      this.piaService
        .delete(id)
        .then(() => {
          localStorage.removeItem('pia-to-remove-id');
          resolve();
        })
        .catch(err => {
          console.error(err);
        });
    });
  }

  unarchive(id): Promise<void> {
    return new Promise((resolve, reject) => {
      this.piaService
        .find(id)
        .then((entry: Pia) => {
          entry.is_archive = 0;
          this.piaService.update(entry);
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
