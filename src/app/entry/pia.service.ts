import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Pia } from './pia.model';

import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class PiaService {

  private _modalsService = new ModalsService();
  pias: any[];
  pia: Pia = new Pia();

  constructor(private route: ActivatedRoute) { }

  /**
   * Gets the PIA.
   * @return the PIA object.
   */
  async getPIA() {
    return new Promise((resolve, reject) => {
      const piaId = parseInt(this.route.snapshot.params['id'], 10);
      this.pia.get(piaId).then((entry) => {
        resolve();
      });
    });
  }

  /**
   * Allows an user to remove a PIA.
   */
  removePIA() {
    const piaID = parseInt(localStorage.getItem('pia-id'), 10);

    // Removes from DB.
    const pia = new Pia();
    pia.delete(piaID);

    /* TODO : refactor this... */
    // Deletes the PIA from the view.
    document.querySelector('.pia-cardsBlock.pia-doingBlock[data-id="' + piaID + '"]').remove();

    localStorage.removeItem('pia-id');
    this._modalsService.closeModal();
  }

}
