import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { Pia } from '../entry/pia.model';
import { Structure } from '../structures/structure.model';

import { ModalsService } from './modals.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { PiaService } from 'app/services/pia.service';
import { StructureService } from 'app/services/structure.service';
import { AnswerStructureService } from 'app/services/answer-structure.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  providers: [PiaService, StructureService]
})
export class ModalsComponent implements OnInit {
  @Input() pia: any;
  @Input() structure: any;
  newPia: Pia;
  newStructure: Structure;
  piaForm: FormGroup;
  structureForm: FormGroup;
  removeAttachmentForm: FormGroup;
  enableSubmit = true;

  constructor(
    private router: Router,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    public _structureService: StructureService,
    public _answerStructureService: AnswerStructureService,
    public _measuresService: MeasureService,
    public _attachmentsService: AttachmentsService
  ) { }

  ngOnInit() {
    const structure = new Structure();
    structure.getAll().then((data: any) => {
      this._structureService.structures = data;
    });

    this._piaService.getPIA();
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl(),
      structure: new FormControl([])
    });
    this.structureForm = new FormGroup({
      name: new FormControl(),
      sector_name: new FormControl()
    });
    this.removeAttachmentForm = new FormGroup({
      comment: new FormControl()
    });
    this.newPia = new Pia();
    this.newStructure = new Structure();
  }

  /**
   * Returns to homepage (used on several modals).
   * @memberof ModalsComponent
   */
  returnToHomepage() {
    this._modalsService.closeModal();
    this.router.navigate(['/home']);
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   * @memberof ModalsComponent
   */
  onSubmit() {
    this._piaService.saveNewPia(this.piaForm).then((id: number) => {
      this.router.navigate(['entry', id, 'section', 1, 'item', 1]);
    });
  }

  /**
   * Save the newly created Structure.
   * Sends to the path associated to this new Structure.
   * @memberof ModalsComponent
   */
  onSubmitStructure() {
    const structure = new Structure();
    structure.name = this.structureForm.value.name;
    structure.sector_name = this.structureForm.value.sector_name;
    structure.data = this._piaService.data;
    const p = structure.create();
    p.then((id) => this.router.navigate(['structures', 'entry', id, 'section', 1, 'item', 1]));
  }

  /**
   * Focuses out from the comment attachment field.
   * @memberof ModalsComponent
   */
  attachmentCommentFocusOut() {
    if (this.removeAttachmentForm.controls['comment'].value &&
        this.removeAttachmentForm.controls['comment'].value.length > 0) {
      this.enableSubmit = false;
    }
  }
}
