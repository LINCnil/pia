import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';



@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss']
})
export class ValidatePIAComponent implements OnInit {
  validateForm: FormGroup;

  constructor() {}

  ngOnInit() {
    this.validateForm = new FormGroup({
      validateStatus: new FormControl()
    });
  }

  onCheck() {
    let allBtnChecked = true;
    const radioButtons = document.querySelectorAll('.pia-entryContentBlock-content-list-confirm input');
    const simpleValidationBtn = document.getElementById('pia-simple-validation');
    const signValidationBtn = document.getElementById('pia-sign-validation');
    /*const signedValidationBtn =*/

    [].forEach.call(radioButtons, function(currentRadioBtn) {
      if (!currentRadioBtn.checked) {
        allBtnChecked = false;
      } else {
        allBtnChecked = true;
      }
    });

    if (allBtnChecked) {
      simpleValidationBtn.removeAttribute('disabled');
      signValidationBtn.removeAttribute('disabled');
    }
  }

  lockStatus(event) {
    const clickedRadioButton = event.target || event.srcElement || event.currentTarget;
    clickedRadioButton.setAttribute('disabled', true);

  }

}
