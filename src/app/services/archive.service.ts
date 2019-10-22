import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Pia } from 'src/app/entry/pia.model';

import { ModalsService } from 'src/app/modals/modals.service';
import { LanguagesService } from 'src/app/services/languages.service';


@Injectable()
export class ArchiveService {
  archivedPias = [];

  constructor(private route: ActivatedRoute,
              private httpClient: HttpClient,
              private _modalsService: ModalsService,
              private _languagesService: LanguagesService) { }

  /**
   * Allows an user to remove an archived PIA
   */
  removeArchivedPia() {
    const id = parseInt(localStorage.getItem('archive-id'), 10);

    // Removes from DB
    const archivedPia = new Pia();
    archivedPia.delete(id);

    // Deletes the PIA from the view
    if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
      document.querySelector('.app-list-item[data-id="' + id + '"]').remove();
    } else {
      document.querySelector('.pia-cardsBlock.pia[data-id="' + id + '"]').remove();
    }

    localStorage.removeItem('archive-id');
    this._modalsService.closeModal();
  }

}
