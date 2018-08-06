import { Component, OnInit, Input } from '@angular/core';
import { PiaModel } from '@api/models';
import { PiaService } from '../../../entry/pia.service';
import { ModalsService } from '../../../modals/modals.service';

@Component({
  selector: '[app-pias-list-item]',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class PiasListItemComponent implements OnInit {

  @Input() pia: PiaModel

  constructor(
    public _piaService: PiaService,
    private _modalsService: ModalsService
  ) { }

  ngOnInit() {
  }

    /**
   * Deletes a PIA with a given id.
   * @param {string} id - The PIA id.
   * @memberof CardItemComponent
   */
  removePia(id: string) {
    localStorage.setItem('pia-id', id);
    this._modalsService.openModal('modal-remove-pia');
  }
}
