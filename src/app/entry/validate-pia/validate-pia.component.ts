import { Component, OnInit, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalsComponent } from '../../modals/modals.component';
import * as jsPDF from 'jspdf';
@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss']
})
export class ValidatePIAComponent implements OnInit {

  modal = new ModalsComponent(this.router);
  validateForm: FormGroup;

  constructor(private el: ElementRef, private router: Router) {
    this.router = router;
  }

  ngOnInit() {
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

    [].forEach.call(radioButtons, function(currentRadioBtn) {
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

  // dimissAttachement() {
  //   const closeAttachement = this.el.nativeElement.querySelector('.pia-entryContentBlock-footer-validationAttachments');
  //
  // }

  /**
   * Allows users to make a simple validation of a PIA.
   */
  simplePIAValidation() {
    this.modal.openModal('modal-simple-pia-validation');
  }

  /**
   * Allows users to make a signed validation of a PIA.
   */
  signedPIAValidation() {
    this.modal.openModal('modal-signed-pia-validation');
  }

  /**
   * Allows users to download the PIA as a .pdf file.
   */
  downloadPIA() {
    document.createElement('canvas');
    let doc = new jsPDF('p', 'pt', 'a4');
    const test = "test";
    doc.text(20, 20, 'Hello' + test + 'world!');
    doc.save('autoprint.pdf');



    /* Could be useful :
    Get all sections, items, questions/measures.
    Then make an autoTable per section or something like that...
    convert(){
      var item = {
        "Name" : "XYZ",
        "Age" : "22",
        "Gender" : "Male"
      };
      var doc = new jsPDF();
      var col = ["Details", "Values"];
      var rows = [];

      for(var key in item){
          var temp = [key, item[key]];
          rows.push(temp);
      }

      doc.autoTable(col, rows);

      doc.save('Test.pdf');
    }*/

  }

}
