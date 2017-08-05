import { Component, OnInit, ComponentRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Pia } from '../../entry/pia.model';
import { Router } from '@angular/router';

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
  editMode: Boolean;
  piaForm: FormGroup;
  progress: number;

  constructor(private router: Router,
              private _modalsService: ModalsService,
              private _piaService: PiaService) {
    this.editMode = false;
  }

  ngOnInit() {
    this._piaService.getProgress(this.pia.id).then((nb: number) => {
      this.progress = nb;
    });
    this.piaForm = new FormGroup({
      id: new FormControl(this.pia.id),
      name: new FormControl({ value: this.pia.name, disabled: true }),
      author_name: new FormControl({ value: this.pia.author_name, disabled: true }),
      evaluator_name: new FormControl({ value: this.pia.evaluator_name, disabled: true }),
      validator_name: new FormControl({ value: this.pia.validator_name, disabled: true })
    });
  }

  /**
   * Enables or disables edition mode on PIA main fields.
   */
  activateEdition() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.piaForm.enable();
    } else {
      this.piaForm.disable();
    }
  }

  onSubmit() {
    const pia = new Pia();
    pia.id = this.piaForm.value.id;
    pia.find(pia.id).then((entry: any) => {
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
   */
  removePia(id: string) {
    localStorage.setItem('pia-id', id);
    this._modalsService.openModal('modal-remove-pia');
  }

  /**
   * Checks the current status of the PIA.
   * @return true if the PIA is in progress, false otherwise.
   */
  isOngoingPIA() {
    return this.pia.status === 0;
  }
}
