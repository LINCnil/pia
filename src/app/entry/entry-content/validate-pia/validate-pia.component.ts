import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as jsPDF from 'jspdf';
import { Http } from '@angular/http';
import { Pia } from 'app/entry/pia.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { PiaService } from 'app/entry/pia.service';
import { ModalsService } from 'app/modals/modals.service';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';

@Component({
  selector: 'app-validate-pia',
  templateUrl: './validate-pia.component.html',
  styleUrls: ['./validate-pia.component.scss'],
  providers: [PiaService]
})
export class ValidatePIAComponent implements OnInit {

  data: { sections: any };
  validateForm: FormGroup;
  pdfNotReady = true;
  jsonInfo = [];
  pdf = [];
  attachment: any;

  constructor(private el: ElementRef,
              private _modalsService: ModalsService,
              private _actionPlanService: ActionPlanService,
              private _attachmentsService: AttachmentsService,
              private _piaService: PiaService, private http: Http ) {
  }

  ngOnInit() {
    this.validateForm = new FormGroup({
      validateStatus1: new FormControl(),
      validateStatus2: new FormControl(),
      validateStatus3: new FormControl(),
      validateStatus4: new FormControl()
    });
    this._piaService.getPIA().then(() => {
      this.validateForm.controls['validateStatus1'].patchValue(this._piaService.pia.status > 1);
      this.validateForm.controls['validateStatus2'].patchValue(this._piaService.pia.status > 1);
      this.validateForm.controls['validateStatus3'].patchValue(this._piaService.pia.status > 1);
      this.validateForm.controls['validateStatus4'].patchValue(this._piaService.pia.status > 1);
    });
    this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
      this.data = data;
      this._actionPlanService.data = this.data;
      this._piaService.getPIA().then(() => {
        this._actionPlanService.pia = this._piaService.pia;
        this._attachmentsService.pia = this._piaService.pia;
        this._attachmentsService.listAttachments().then(() => {
          this.attachment = this._attachmentsService.attachments[this._attachmentsService.attachments.length - 1];
        });
        this.getJsonInfo().then(() => {
          this.preparePdf();
        });
      })
    });
  }

  addAttachment() {
    const attachment: any = document.querySelector('[formcontrolname="attachment_file"]');
    attachment.click();
  }

  downloadAttachment(id: number) {
    this._attachmentsService.downloadAttachment(id);
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
    this._piaService.pia.status = 2;
    this._piaService.pia.update().then(() => {
      this._modalsService.openModal('modal-simple-pia-validation');
    });
  }

  /**
   * Allows users to make a signed validation of a PIA.
   */
  signedPIAValidation() {
    this._piaService.pia.status = 3;
    this._piaService.pia.update().then(() => {
      this._modalsService.openModal('modal-signed-pia-validation');
    });
  }

  /**
   * Allows users to download the PIA as a .pdf file.
   */
  downloadPIA() {
    // Start of the loop for each lines
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(12);
    let i = 1;
    this.pdf.forEach((entry) => {
      if (i === 34) {
        // Add a new page every 34 lines
        i = 1;
        doc.addPage();
      }
      i++;
      // Add a new line every 90 characters
      entry = entry.replace(/(.{90})/g, '$1\n');
      const count = (entry.match(new RegExp('\n', 'g')) || []).length;

      doc.text(entry, 10, i * 10);
      i += count;
    });
    doc.addPage();
    i = 1;
    this.jsonInfo.forEach((entry) => {
      if (i === 34) {
        // Add a new page every 34 lines
        i = 1;
        doc.addPage();
      }
      i++;
      // Add a new line every 90 characters
      entry = entry.replace(/(.{90})/g, '$1\n');
      const count = (entry.match(new RegExp('\n', 'g')) || []).length;
      if (entry.startsWith('Question') || entry.startsWith('Réponse') || entry.startsWith('Titre de la mesure')) {
        doc.setFontStyle('bold');
      } else {
        doc.setFontStyle('normal');
      }
      doc.text(entry, 10, i * 10);
      i += count;
    });

    doc.save('pia_' + this._piaService.pia.id + '.pdf');
  }

  downloadActionPlan() {
    const doc = new jsPDF();
    doc.setFontSize(12);
    let i = 1;
    doc.setFontStyle('bold');
    doc.text('Principes fondamentaux', 10, i * 10);
    doc.setFontStyle('normal');
    i++;

    // TODO - Add estimated_evaluation_date and person_in_charge data

    if (this._actionPlanService.noPrinciplesActionPlan) {
      doc.text('Aucun plan d\'action enregistré.', 10, i * 10);
      i++;
    } else {
      this._actionPlanService.results.forEach((data: any) => {
        i++;
        if (i === 34) {
         // Add a new page every 34 lines
          i = 1;
          doc.addPage();
        }
        doc.text(data.short_title, 10, i * 10);
        i++;
        // Add a new line every 90 characters
        const entry = data.evaluation.action_plan_comment.replace(/(.{90})/g, '$1\n');
        const count = (entry.match(new RegExp('\n', 'g')) || []).length;

        doc.text(entry, 10, i * 10);
        i += count;
      });
    }
    doc.setFontStyle('bold');
    doc.text('Mesures existantes ou prévues', 10, i * 10);
    doc.setFontStyle('normal');
    i++;
    if (this._actionPlanService.noMeasuresActionPlan) {
      doc.text('Aucun plan d\'action enregistré.', 10, i * 10);
      i++;
    } else {
      this._actionPlanService.measures.forEach((data: any) => {
        i++;
        if (i === 34) {
         // Add a new page every 34 lines
          i = 1;
          doc.addPage();
        }
        doc.text(data.short_title, 10, i * 10);
        i++;
        // Add a new line every 90 characters
        const entry = data.evaluation.action_plan_comment.replace(/(.{90})/g, '$1\n');
        const count = (entry.match(new RegExp('\n', 'g')) || []).length;

        doc.text(entry, 10, i * 10);
        i += count;
      });
    }
    doc.setFontStyle('bold');
    doc.text('Risques', 10, i * 10);
    doc.setFontStyle('normal');
    i++;
    if (this._actionPlanService.noRisksActionPlan) {
      doc.text('Aucun plan d\'action enregistré.', 10, i * 10);
      i++;
    } else {
      if (this._actionPlanService.risks['3.2'] && this._actionPlanService.risks['3.2'].action_plan_comment) {
        if (this._actionPlanService.risks['3.2'].short_title) {
          doc.text(this._actionPlanService.risks['3.2'].short_title, 10, i * 10);
          i++;
        }
        const entry = this._actionPlanService.risks['3.2'].action_plan_comment.replace(/(.{90})/g, '$1\n');
        const count = (entry.match(new RegExp('\n', 'g')) || []).length;
        doc.text(entry, 10, i * 10);
        i += count;
      }
      if (this._actionPlanService.risks['3.3'] && this._actionPlanService.risks['3.3'].action_plan_comment) {
        if (this._actionPlanService.risks['3.3'].short_title) {
          doc.text(this._actionPlanService.risks['3.3'].short_title, 10, i * 10);
          i++;
        }
        const entry = this._actionPlanService.risks['3.3'].action_plan_comment.replace(/(.{90})/g, '$1\n');
        const count = (entry.match(new RegExp('\n', 'g')) || []).length;
        doc.text(entry, 10, i * 10);
        i += count;
      }
      if (this._actionPlanService.risks['3.4'] && this._actionPlanService.risks['3.4'].action_plan_comment) {
        if (this._actionPlanService.risks['3.4'].short_title) {
          doc.text(this._actionPlanService.risks['3.4'].short_title, 10, i * 10);
          i++;
        }
        const entry = this._actionPlanService.risks['3.4'].action_plan_comment.replace(/(.{90})/g, '$1\n');
        const count = (entry.match(new RegExp('\n', 'g')) || []).length;
        doc.text(entry, 10, i * 10);
        i += count;
      }
      if (i === 34) {
        // Add a new page every 34 lines
        i = 1;
        doc.addPage();
      }
    }
    doc.save('action_plan_' + this._piaService.pia.id + '.pdf');
  }

  private preparePdf() {
    const pia = this._piaService.pia;

    if (pia.name && pia.name.length > 0) {
      this.pdf.push('Nom du Pia : ' +  pia.name);
    }
    if (pia.author_name && pia.author_name.length > 0) {
      this.pdf.push('Nom de l\'auteur : ' +  pia.author_name);
    }
    if (pia.evaluator_name && pia.evaluator_name.length > 0) {
      this.pdf.push('Nom de l\'évaluateur : ' +  pia.evaluator_name);
    }
    if (pia.validator_name && pia.validator_name.length > 0) {
      this.pdf.push('Nom du validateur : ' +  pia.validator_name);
    }

    if (pia.dpos_names && pia.dpos_names.length > 0) {
      this.pdf.push('Nom du DPO : ' +  pia.dpos_names);
    }
    if ( pia.dpo_status >= 0) {
      this.pdf.push('Statut du DPO : ' +  pia.getOpinionsStatus(pia.dpo_status.toString()));
    }
    if (pia.dpo_opinion && pia.dpo_opinion.length > 0) {
      this.pdf.push('Opinion du DPO : ' +  pia.dpo_opinion);
    }

    if (pia.people_names && pia.people_names.length > 0) {
      this.pdf.push('Nom des personnes concernées : ' +  pia.people_names);
    }
    if (pia.concerned_people_status >= 0) {
      this.pdf.push('Statut des personnes concernées : ' +  pia.getOpinionsStatus(pia.concerned_people_status.toString()));
    }
    if (pia.concerned_people_opinion && pia.concerned_people_opinion.length > 0) {
      this.pdf.push('Opinion des personnes concernées : ' +  pia.concerned_people_opinion);
    }

    if (pia.applied_adjustements && pia.applied_adjustements.length > 0) {
      this.pdf.push('Modifications apportées : ' +  pia.applied_adjustements);
    }
    if (pia.rejected_reason && pia.rejected_reason.length > 0) {
      this.pdf.push('Raison du refus : ' +  pia.rejected_reason);
    }
    if (pia.created_at) {
      this.pdf.push('Date de création : ' +  pia.created_at);
    }

    this.pdfNotReady = false;
  }

  private async getJsonInfo() {
    // TODO - Add a promise
    this._actionPlanService.listActionPlan();
    return new Promise((resolve, reject) => {
      const countSection = this.data.sections.length;
      let i = 0;
      this.data.sections.forEach((section) => {
        i++;
        section.items.forEach((item) => {
          if (item.is_measure) {
            const measuresModel = new Measure();
            measuresModel.pia_id = this._piaService.pia.id;
            measuresModel.findAll().then((entries: any[]) => {
              entries.forEach((measure) => {
                if (measure.title !== undefined && measure.content !== undefined) {
                  this.jsonInfo.push('Titre de la mesure : ' + measure.title);
                  this.jsonInfo.push('Contenu de la mesure : ' + measure.content);
                }
              });
              if (i === countSection) {
                resolve();
              }
            });
          } else if (item.questions) {
            item.questions.forEach((question) => {
              const answerModel = new Answer();
              answerModel.getByReferenceAndPia(this._piaService.pia.id, question.id).then(() => {
                if (answerModel.data) {
                  this.jsonInfo.push('Question : ' + question.title);
                  let gauge = '';
                  if (answerModel.data.gauge && answerModel.data.gauge > 0) {
                    gauge = this._piaService.pia.getGaugeName(answerModel.data.gauge);
                  }
                  this.jsonInfo.push('Réponse : ' + gauge);
                  if (answerModel.data.text && answerModel.data.text.length > 0) {
                    this.jsonInfo.push(answerModel.data.text);
                  }
                  if (answerModel.data.list && answerModel.data.list.length > 0) {
                    this.jsonInfo.push(answerModel.data.list.join(', '));
                  }
                }
                if (i === countSection) {
                  resolve();
                }
              });
            });
          }
        });
      });
    });
  }
}
