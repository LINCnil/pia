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
    private _modalsService: ModalsService,
    public _appDataService: AppDataService,
    public _sidStatusService: SidStatusService
  ) {
    this.data = this._appDataService.dataNav;
  }

  /**
   * Sends back an archived PIA to an active PIA
   */
  unarchivePia() {
    const id = parseInt(localStorage.getItem('pia-to-unarchive-id'), 10);

    // Update the PIA in DB.
    const pia = new Pia();
    pia.get(id).then(() => {
      pia.is_archive = 0;
      pia.update();
    });

    // Deletes the PIA from the view
    if (
      localStorage.getItem('homepageDisplayMode') &&
      localStorage.getItem('homepageDisplayMode') === 'list'
    ) {
      document.querySelector('.app-list-item[data-id="' + id + '"]').remove();
    } else {
      document
        .querySelector('.pia-cardsBlock.pia[data-id="' + id + '"]')
        .remove();
    }

    localStorage.removeItem('pia-to-unarchive-id');
    this._modalsService.closeModal();
  }

  /**
   * Allows an user to definitely remove an archived PIA
   */
  removeArchivedPia() {
    const id = parseInt(localStorage.getItem('pia-to-remove-id'), 10);

    // Removes from DB
    const archivedPia = new Pia();
    archivedPia.delete(id);

    // Deletes the PIA from the view
    if (
      localStorage.getItem('homepageDisplayMode') &&
      localStorage.getItem('homepageDisplayMode') === 'list'
    ) {
      document.querySelector('.app-list-item[data-id="' + id + '"]').remove();
    } else {
      document
        .querySelector('.pia-cardsBlock.pia[data-id="' + id + '"]')
        .remove();
    }

    localStorage.removeItem('pia-to-remove-id');
    this._modalsService.closeModal();
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
}
