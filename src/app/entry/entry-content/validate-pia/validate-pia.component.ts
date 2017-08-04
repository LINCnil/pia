import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as jsPDF from 'jspdf';
import { Http } from '@angular/http';

import { Pia } from 'app/entry/pia.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { PiaService } from 'app/entry/pia.service';
import { ModalsService } from 'app/modals/modals.service';
import { MeasureService } from '../measures/measures.service';





@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss'],
  providers: [PiaService]
})
export class ValidatePIAComponent implements OnInit {

  data: { sections: any };
  validateForm: FormGroup;

  constructor(private el: ElementRef,
              private _modalsService: ModalsService,
              private _piaService: PiaService, private http: Http,
              private _measureService: MeasureService ) {

    this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
      this.data = data;

    });

  }

  ngOnInit() {
    this._piaService.getPIA();

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
    /* TODO : PIA status Condition Problem with 0 */


  // PIA data

    const pdf = [''];
    const pia = this._piaService.pia;

    if (pia.name && pia.name.length > 0) {
      pdf.push('Nom du Pia: ' +  pia.name);
    }
    if (pia.author_name && pia.author_name.length > 0) {
      pdf.push('Nom de l\'auteur: ' +  pia.author_name);
    }
    if (pia.evaluator_name && pia.evaluator_name.length > 0) {
      pdf.push('Nom de l\'évaluateur: ' +  pia.evaluator_name);
    }
    if (pia.validator_name && pia.validator_name.length > 0) {
      pdf.push('Nom du validateur: ' +  pia.validator_name);
    }
    if (pia.dpos_names && pia.dpos_names.length > 0) {
      pdf.push('Nom DPO: ' +  pia.dpos_names);
    }
    if (pia.dpo_opinion && pia.dpo_opinion.length > 0) {
      pdf.push('Opinion DPO: ' +  pia.dpo_opinion);
    }
    if (pia.concerned_people_status === 0 || pia.concerned_people_status === 1 ) {
      pdf.push('Status des personnes: ' +  pia.getOpinionsStatus(pia.concerned_people_status));
    }
    if (pia.status === 0 || pia.status === 1 || pia.status === 2 || pia.status === 3) {
      pdf.push('Status: ' +  pia.getStatusName());
    }
    if ( pia.dpo_status === 0 || pia.dpo_status === 1 ) {
      console.log(pia.dpo_status);
      pdf.push('Status DPO: ' +  pia.getOpinionsStatus(pia.dpo_status));
    }
    if (pia.people_names && pia.people_names.length > 0) {
      pdf.push('Nom des personnes: ' +  pia.people_names);
    }
    if (pia.concerned_people_opinion && pia.concerned_people_opinion.length > 0) {
      pdf.push('Opinion des personnes concernées: ' +  pia.concerned_people_opinion);
    }
    if (pia.applied_adjustements && pia.applied_adjustements.length > 0) {
      pdf.push('Modifications apportées: ' +  pia.applied_adjustements);
    }
    if (pia.rejected_reason && pia.rejected_reason.length > 0) {
      pdf.push('Raison du refus: ' +  pia.rejected_reason);
    }
    if (pia.created_at) {
      pdf.push('Date de création: ' +  pia.created_at);
    }


    this.data.sections.forEach((section) => {
      section.items.forEach((item) => {
        if (section.id === 3 && item.id === 1 ) {
          this._measureService.measures.forEach((measure) => {
            if (measure.title !== undefined && measure.content !== undefined) {
              console.log( 'Titre de la mesure: ' + measure.title);
              console.log('Contenu de la mesure: ' + measure.content);
            }
          });
        } else {
          if (item.questions) {
            item.questions.forEach((question) => {
              console.log(question.title);
              const answerModel = new Answer();
              answerModel.getByReferenceAndPia(this._piaService.pia.id, question.id).then(() => {
                if (answerModel.data) {
                  /* TODO recheck gauge values when questions doesn't have à gauge*/
                  console.log(answerModel.data.gauge);
                  console.log(answerModel.data.list);
                  console.log(answerModel.data.text);
                }
              });
            });
          }
        }
      });
    });

    // Start of the loop for each lines and the good separate
   /* //populate page
    doc.setFontSize(12);
    pdf.forEach((entry) => {
      i++;
      while ( i < 10)
      doc.text(entry, 20, i * 20);
    });
    doc.save('autoprint.pdf');*/
  }
}
