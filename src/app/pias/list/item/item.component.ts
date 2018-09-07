import { Component, OnInit, Input } from '@angular/core';
import { PiaModel } from '@api/models';
import { PiaService } from '../../../entry/pia.service';
import { ModalsService } from '../../../modals/modals.service';
import { FormGroup, FormControl } from '@angular/forms';
import { PiaApi } from '@api/services';

@Component({
  selector: '[app-pias-list-item]',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class PiasListItemComponent implements OnInit {

  @Input() pia: PiaModel
  piaFormGroup: FormGroup
  constructor(
    private _piaApi: PiaApi,
    public _piaService: PiaService,
    private _modalsService: ModalsService
  ) { }

  ngOnInit() {
    this.piaFormGroup = new FormGroup({
      author_name: new FormControl(this.pia.author_name),
      evaluator_name: new FormControl(this.pia.evaluator_name),
      validator_name: new FormControl(this.pia.validator_name),
    });
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

  onUpdated(model: any) {
    this.pia = model;
    this._piaApi.update(this.pia).subscribe(pia => {
      this.pia = pia;
    })
  }
}
