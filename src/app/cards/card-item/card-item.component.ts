import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
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
  piaForm: FormGroup;
  attachments: any;

  @ViewChild('piaName') private piaName: ElementRef;
  @ViewChild('piaAuthorName') private piaAuthorName: ElementRef;
  @ViewChild('piaEvaluatorName') private piaEvaluatorName: ElementRef;
  @ViewChild('piaValidatorName') private piaValidatorName: ElementRef;

  constructor(private router: Router,
              private _modalsService: ModalsService,
              public _piaService: PiaService) { }

  ngOnInit() {
    this.piaForm = new FormGroup({
      id: new FormControl(this.pia.id),
      name: new FormControl({ value: this.pia.name, disabled: false }),
      author_name: new FormControl({ value: this.pia.author_name, disabled: false }),
      evaluator_name: new FormControl({ value: this.pia.evaluator_name, disabled: false }),
      validator_name: new FormControl({ value: this.pia.validator_name, disabled: false })
    });

    const attachmentModel = new Attachment();
    attachmentModel.pia_id = this.pia.id;
    attachmentModel.findAll().then((entries: any) => {
      this.attachments = entries;
    });

  }

  /**
   * Focuses pia name field.
   */
  piaNameFocusIn() {
    this.piaForm.controls['name'].enable();
    this.piaName.nativeElement.focus();
  }

  /**
   * Disables pia name field and saves data.
   */
  piaNameFocusOut() {
    let userText = this.piaForm.controls['name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      const pia = new Pia();
      pia.get(this.piaForm.value.id).then(() => {
        pia.name = this.piaForm.value.name;
        pia.update();
      });
    }
  }

  /**
   * Focuses pia author name field.
   */
  piaAuthorNameFocusIn() {
    this.piaAuthorName.nativeElement.focus();
  }

  /**
   * Disables pia author name field and saves data.
   */
  piaAuthorNameFocusOut() {
    let userText = this.piaForm.controls['author_name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      const pia = new Pia();
      pia.get(this.piaForm.value.id).then(() => {
        pia.author_name = this.piaForm.value.author_name;
        pia.update();
      });
    }
  }

  /**
   * Focuses pia evaluator name field.
   */
  piaEvaluatorNameFocusIn() {
    this.piaEvaluatorName.nativeElement.focus();
  }

  /**
   * Disables pia evaluator name field and saves data.
   */
  piaEvaluatorNameFocusOut() {
    let userText = this.piaForm.controls['evaluator_name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      const pia = new Pia();
      pia.get(this.piaForm.value.id).then(() => {
        pia.evaluator_name = this.piaForm.value.evaluator_name;
        pia.update();
      });
    }
  }

  /**
   * Focuses pia validator name field.
   */
  piaValidatorNameFocusIn() {
    this.piaValidatorName.nativeElement.focus();
  }

  /**
   * Disables pia validator name field and saves data.
   */
  piaValidatorNameFocusOut() {
    let userText = this.piaForm.value.validator_name;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      const pia = new Pia();
      pia.get(this.piaForm.value.id).then(() => {
        pia.validator_name = this.piaForm.value.validator_name;
        pia.update();
      });
    }
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
