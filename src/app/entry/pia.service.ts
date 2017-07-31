import { Injectable } from '@angular/core';

import { Pia } from './pia.model';

import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class PiaService {

  private _modalsService = new ModalsService();
  pias: any[];

  /**
   * Allows an user to remove a PIA.
   */
  removePIA() {
    const piaID = parseInt(localStorage.getItem('pia-id'), 10);

    // Removes from DB.
    const pia = new Pia();
    pia.delete(piaID);

    // Deletes from the pias array.
    const index = this.pias.findIndex(p => p.id === piaID);
    if (index !== -1) {
      this.pias.splice(index, 1);
    }

    localStorage.removeItem('pia-id');
    this._modalsService.closeModal();
  }

}
