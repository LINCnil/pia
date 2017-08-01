import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Pia } from './pia.model';

import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class PiaService {

  private _modalsService = new ModalsService();
  pias: any[];
  private pia: Pia;

  constructor(private route: ActivatedRoute) { }

  /**
   * Gets the PIA.
   * @return the PIA object.
   */
  getPIA() {
    if (!this.pia) {
      console.log(this.route);
      const piaId = parseInt(this.route.snapshot.params['id'], 10);
      console.log(piaId);
      this.pia = new Pia();
      this.pia.get(piaId);
    }
    return this.pia;
  }

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
