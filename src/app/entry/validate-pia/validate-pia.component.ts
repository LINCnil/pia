import {Component, OnInit, ElementRef, Renderer2} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';


@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss']
})
export class ValidatePIAComponent implements OnInit {
  validateForm: FormGroup;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.validateForm = new FormGroup({
      validateStatus: new FormControl()
    });
    console.log(this.renderer);
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

  // dimissAttachement() {
  //   const closeAttachement = this.el.nativeElement.querySelector('.pia-entryContentBlock-footer-validationAttachments');
  //
  // }

}
