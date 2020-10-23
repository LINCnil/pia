import { Injectable } from '@angular/core';


import { AppDataService } from 'src/app/services/app-data.service';
import { Pia } from '../models/pia.model';
import { ModalsService } from './modals.service';
import { SidStatusService } from './sid-status.service';

@Injectable()
export class ArchiveService {
  archivedPias = [];
  data: { sections: any };

  constructor(
    private modalsService: ModalsService,
    public _appDataService: AppDataService,
    public _sidStatusService: SidStatusService
  ) {
    this.data = this._appDataService.dataNav;
  }

  async calculProgress() {
    this.archivedPias.forEach((archivedPia: Pia) => {
      this.calculPiaProgress(archivedPia);
    });
  }

  async calculPiaProgress(pia) {
    pia.progress = 0.0;
    if (pia.status > 0) {
      pia.progress += 4;
    }
    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        this._sidStatusService.setSidStatus(pia, section, item);
      });
    });
  }

  // UPDATE
  remove(id): Promise<void> {
    return new Promise((resolve, reject) => {
      // Removes from DB
      const archivedPia = new Pia();
      archivedPia.delete(id)
        .then(() => {
          localStorage.removeItem('pia-to-remove-id');
          resolve();
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }

  unarchive(id): Promise<void> {
    return new Promise((resolve, reject) => {
      const pia = new Pia();
      pia.get(id)
        .then(() => {
          pia.is_archive = 0;
          pia.update();
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
