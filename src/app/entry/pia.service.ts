import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Pia } from './pia.model';

import { ModalsService } from 'app/modals/modals.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';

@Injectable()
export class PiaService {

  private _modalsService = new ModalsService();
  pias: any[];
  pia: Pia = new Pia();

  constructor(private route: ActivatedRoute, private _evaluationService: EvaluationService) { }

  /**
   * Gets the PIA.
   * @return the PIA object.
   */
  async getPIA() {
    return new Promise((resolve, reject) => {
      const piaId = parseInt(this.route.snapshot.params['id'], 10);
      this.pia.get(piaId).then((entry) => {
        this._evaluationService.setPia(this.pia);
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
