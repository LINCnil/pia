import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Pia } from '../../entry/pia.model';
import { Router } from '@angular/router';

import { Attachment } from 'app/entry/attachments/attachment.model';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss',
    './card-item_doing.component.scss', './card-item_archived.component.scss'],
})
export class CardItemComponent implements OnInit {
  @Input() pia: any;
  @Input() previousPia: any;
  editMode: Boolean;
  piaForm: FormGroup;
  attachments: any;

  constructor(private router: Router,
              private _modalsService: ModalsService,
              protected _piaService: PiaService) {
    this.editMode = false;
  }

  ngOnInit() {
    this.piaForm = new FormGroup({
      id: new FormControl(this.pia.id),
      name: new FormControl({ value: this.pia.name, disabled: true }),
      author_name: new FormControl({ value: this.pia.author_name, disabled: true }),
      evaluator_name: new FormControl({ value: this.pia.evaluator_name, disabled: true }),
      validator_name: new FormControl({ value: this.pia.validator_name, disabled: true })
    });

    const attachmentModel = new Attachment();
    attachmentModel.pia_id = this.pia.id;
    attachmentModel.findAll().then((entries: any) => {
      this.attachments = entries;
    });

  }

  /**
   * Enables or disables edition mode on PIA main fields.
   * @memberof CardItemComponent
   */
  activateEdition() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.piaForm.enable();
    } else {
      this.piaForm.disable();
    }
  }

  /**
   * Update PIA informations
   * @returns {Promise}
   * @memberof CardItemComponent
   */
  onSubmit() {
    const pia = new Pia();
    pia.get(this.piaForm.value.id).then(() => {
      pia.name = this.piaForm.value.name;
      pia.author_name = this.piaForm.value.author_name;
      pia.evaluator_name = this.piaForm.value.evaluator_name;
      pia.validator_name = this.piaForm.value.validator_name;
      pia.update();
      this.activateEdition();
    });
  }

  /**
   * Deletes a PIA with a given id.
   * @param {string} id unique id of the PIA to be deleted.
   * @memberof CardItemComponent
   */
  removePia(id: string) {
    localStorage.setItem('pia-id', id);
    this._modalsService.openModal('modal-remove-pia');
  }

  /**
   * Export a PIA in JSON format
   * @param {number} id
   * @memberof CardItemComponent
   */
  export(id: number) {
    this._piaService.export(id);
  }
}
