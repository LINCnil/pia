import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { PiaService } from '../../entry/pia.service';

import { ProcessingModel } from '@api/models';
import { ProcessingApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';
import { ModalsService } from '../../modals/modals.service';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: [
    './card-item.component.scss',
    './card-item_edit.component.scss',
    './card-item_doing.component.scss',
    './card-item_archived.component.scss'
  ],
})
export class CardItemComponent implements OnInit {
  @Input() processing: any;
  @Input() previousProcessing: any;
  processingForm: FormGroup;

  @ViewChild('processingName') private processingName: ElementRef;
  @ViewChild('processingAuthor') private processingAuthor: ElementRef;
  @ViewChild('processingControllers') private processingControllers: ElementRef;

  constructor(
    private _modalsService: ModalsService,
    public _piaService: PiaService,
    private processingApi: ProcessingApi,
    private permissionsService: PermissionsService
  ) {

  }

  ngOnInit() {

    this.processingForm = new FormGroup({
      id: new FormControl(this.processing.id),
      name: new FormControl({ value: this.processing.name, disabled: true }),
      author: new FormControl({ value: this.processing.author, disabled: true }),
      controllers: new FormControl({ value: this.processing.controllers, disabled: true })
    });

    // add permission verification
    const hasPerm$ = this.permissionsService.hasPermission('CanCreateProcessing');
    hasPerm$.then((bool: boolean) => {
      for (const field in this.processingForm.controls) {
          const fc = this.processingForm.get(field);
          bool ? fc.enable() : fc.disable();
      }
    });
  }

  /**
   * Focuses processing name field.
   * @memberof CardItemComponent
   */
  processingNameFocusIn() {
    this.processingName.nativeElement.focus();
  }

  /**
   * Disables processing name field and saves data.
   * @memberof CardItemComponent
   */
  processingNameFocusOut() {
    let userText = this.processingForm.controls['name'].value;
    if (userText && typeof userText === 'string') {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.processingApi.get(this.processingForm.value.id).subscribe((theProcessing: ProcessingModel) => {
        theProcessing.name = this.processingForm.value.name;
        this.processingApi.update(theProcessing).subscribe();
      });
    }
  }

  /**
   * Focuses pia author name field.
   * @memberof CardItemComponent
   */
  processingAuthorFocusIn() {
    this.processingAuthor.nativeElement.focus();
  }

  /**
   * Disables pia author name field and saves data.
   * @memberof CardItemComponent
   */
  processingAuthorFocusOut() {
    let userText = this.processingForm.controls['author'].value;
    if (userText && typeof userText === 'string') {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.processingApi.get(this.processingForm.value.id).subscribe((theProcessing: ProcessingModel) => {
        theProcessing.author = this.processingForm.value.author_name;
        this.processingApi.update(theProcessing).subscribe();
      });
    }
  }

  /**
   * Focuses pia evaluator name field.
   * @memberof CardItemComponent
   */
  processingControllersFocusIn() {
    this.processingControllers.nativeElement.focus();
  }

  /**
   * Disables pia evaluator name field and saves data.
   * @memberof CardItemComponent
   */
  processingControllersFocusOut() {
    let userText = this.processingForm.controls['controllers'].value;
    if (userText && typeof userText === 'string') {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.processingApi.get(this.processingForm.value.id).subscribe((theProcessing: ProcessingModel) => {
        theProcessing.controllers = this.processingForm.value.evaluator_name;
        this.processingApi.update(theProcessing).subscribe();
      });
    }
  }

    /**
   * Deletes a PIA with a given id.
   * @param {string} id - The PIA id.
   * @memberof CardItemComponent
   */
  removeProcessing(id: string) {
    localStorage.setItem('processing-id', id);
    this._modalsService.openModal('modal-remove-processing');
  }
}
