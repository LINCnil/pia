import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as jsPDF from 'jspdf';

import { Pia } from 'app/entry/pia.model';

import { PiaService } from 'app/entry/pia.service';
import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss'],
  providers: [PiaService]
})
export class ValidatePIAComponent implements OnInit {

  pia: Pia;
  validateForm: FormGroup;

  constructor(private el: ElementRef,
              private _modalsService: ModalsService,
              private _piaService: PiaService) { }

  ngOnInit() {
    this.pia = this._piaService.getPIA();

    this.validateForm = new FormGroup({
      validateStatus: new FormControl()
    });
  }

  /**
   * Checks if the form is valid (radio buttons all checked).
   * If so, enables validation buttons.
   */
  checkValidationFormStatus() {
    let allBtnChecked = true;
    const radioButtons = document.querySelectorAll('.pia-entryContentBlock-content-list-confirm input');
    const simpleValidationBtn = document.getElementById('pia-simple-validation');
    const signValidationBtn = document.getElementById('pia-sign-validation');

    [].forEach.call(radioButtons, function (currentRadioBtn) {
      if (!currentRadioBtn.checked) {
        allBtnChecked = false;
      }
    });

    if (allBtnChecked) {
      simpleValidationBtn.removeAttribute('disabled');
      signValidationBtn.removeAttribute('disabled');
    }
  }

  /**
   * Locks radio buttons after click.
   */
  lockStatus(event) {
    const clickedRadioButton = event.target || event.srcElement || event.currentTarget;
    clickedRadioButton.setAttribute('disabled', true);
  }

  /**
   * Allows users to make a simple validation of a PIA.
   */
  simplePIAValidation() {
    this._modalsService.openModal('modal-simple-pia-validation');
  }

  /**
   * Allows users to make a signed validation of a PIA.
   */
  signedPIAValidation() {
    this._modalsService.openModal('modal-signed-pia-validation');
  }

  /**
   * Allows users to download the PIA as a .pdf file.
   */
  downloadPIA() {
    /* TODO : download PIA as pdf */
    document.createElement('canvas');
    const doc = new jsPDF('p', 'pt', 'a4');
    const test = 'test';
    doc.text(20, 20, 'Hello' + test + 'world!');
    doc.save('autoprint.pdf');
  }

}
