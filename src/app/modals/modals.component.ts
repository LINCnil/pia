import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModalsService } from './modals.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Pia } from '../entry/pia.model';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  providers: [PiaService]
})
export class ModalsComponent implements OnInit {
  @Input() pia: any;
  newPia: Pia;
  piaForm: FormGroup;

  constructor(
    private router: Router,
    private _modalsService: ModalsService,
    private _piaService: PiaService,
    private _measuresService: MeasureService,
    private _attachmentsService: AttachmentsService
  ) { }

  ngOnInit() {
    this._piaService.getPIA();
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl()
    });
    this.newPia = new Pia();
  }

  /**
   * Returns to homepage (used on several modals).
   */
  returnToHomepage() {
    this._modalsService.closeModal();
    this.router.navigate(['/home']);
  }

  /**
   * Allows users to import a PIA.
   */
  importPIA() {
    // TODO import PIA
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   */
  onSubmit() {
    const pia = new Pia();
    pia.name = this.piaForm.value.name;
    pia.author_name = this.piaForm.value.author_name;
    pia.evaluator_name = this.piaForm.value.evaluator_name;
    pia.validator_name = this.piaForm.value.validator_name;
    const p = pia.create();
    p.then((id) => this.router.navigate(['entry', id, 'section', 1, 'item', 1]));
  }
}
