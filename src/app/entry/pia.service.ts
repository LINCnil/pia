import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Pia } from './pia.model';
import { ModalsService } from 'app/modals/modals.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';
import { Http } from '@angular/http';

@Injectable()
export class PiaService {

  pias: any[];
  pia: Pia = new Pia();
  answer: Answer = new Answer();
  data: { sections: any };
  sidStatus = {};
  jsonInfo = [];
  allData = [];

  constructor(private route: ActivatedRoute,
              private _evaluationService: EvaluationService,
              private _attachmentsService: AttachmentsService,
              private _actionPlanService: ActionPlanService,
              private _modalsService: ModalsService, private http: Http) {
                this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
                  this.data = data;
                  this._actionPlanService.data = this.data;
                });
              }

  /**
   * Gets the PIA.
   * @return the PIA object.
   */
  async getPIA() {
    return new Promise((resolve, reject) => {
      const piaId = parseInt(this.route.snapshot.params['id'], 10);
      this.pia.get(piaId).then((entry) => {
        this._evaluationService.setPia(this.pia);
        resolve();
      });
    });
  }

  /**
   * Allows an user to remove a PIA.
   */
  removePIA() {
    const piaID = parseInt(localStorage.getItem('pia-id'), 10);

    // Removes from DB.
    const pia = new Pia();
    pia.delete(piaID);

    /* TODO : refactor this... */
    // Deletes the PIA from the view.
    if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
      document.querySelector('.app-list-item[data-id="' + piaID + '"]').remove();
    } else {
      document.querySelector('.pia-cardsBlock.pia-doingBlock[data-id="' + piaID + '"]').remove();
    }

    localStorage.removeItem('pia-id');
    this._modalsService.closeModal();
  }

  async piaInGlobalValidation() {
    return new Promise((resolve, reject) => {
      // TODO - Count all evaluation_mode
      let countEvaluationMode = 17;
      const measure = new Measure();
      measure.pia_id = this._evaluationService.pia.id;
      const dpoAnswerOk = this._evaluationService.dpoAnswerOk();
      measure.findAll().then((entries: any) => {
        if (entries) {
          countEvaluationMode += entries.length;
        }
        // Count all valid evaluation in DB with global_status === 1
        const evaluation = new Evaluation();
        evaluation.pia_id = this._evaluationService.pia.id;
        evaluation.findAll().then((entries2: any) => {
          const entriesWithGlobalStatus = entries2.filter((e) => {
            return e.global_status === 1;
          });
          resolve((countEvaluationMode === entriesWithGlobalStatus.length) && dpoAnswerOk);
        });
      });
    });
  }

  async setSidStatus() {
    const answer = new Answer();
    const measure = new Measure();
    this.sidStatus = {};
    measure.pia_id = this.pia.id;
    // Check if there is at least one answer
    answer.findAllByPia(this.pia.id).then((entries: any) => {
      if (entries) {
        entries.forEach(element => {
          const ref = element.reference_to.toString().substr(0, 2);
          if (!this.sidStatus[ref]) {
            this.sidStatus[ref] = 1;
          }
        });
      }
      // Check if there is at least one measure
      measure.findAll().then((measures: any) => {
        if (measures && measures.length > 0) {
          this.sidStatus['31'] = 1;
        }
        this.data.sections.forEach(section => {
          section.items.forEach(item => {
            this._evaluationService.isItemIsValidated(section.id, item).then((result: boolean) => {
              const ref = section.id.toString() + item.id.toString();
              if (result && this.sidStatus[ref]) {
                this.sidStatus[ref] = 2;
              }
            })
          });
        });
      });
    });
  }

  async cancelAllValidatedEvaluation() {
    return new Promise((resolve, reject) => {
      let evaluation = new Evaluation();
      evaluation.pia_id = this._evaluationService.pia.id;
      evaluation.findAll().then((entries: any) => {
        entries.forEach(element => {
          evaluation = new Evaluation();
          evaluation.get(element.id).then(() => {
            evaluation.global_status = 0;
            evaluation.update();
          });
        });
        resolve();
      });
    });
  }

  /**
   * Allows users to show the PIA in HTML.
   */
  downloadPia() {
    const alreadyTitle = [];
    document.getElementById('pia-htmlBlock-content').innerHTML = '';
    this.prepareHeader();
    document.getElementById('pia-htmlBlock-content').innerHTML += '<h1>Pièces jointes</h1>';
    document.getElementById('pia-htmlBlock-content').innerHTML += '<ul>';
    this._attachmentsService.attachments.forEach((attachment) => {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<li>' + attachment.name + '</li>';
    });
    document.getElementById('pia-htmlBlock-content').innerHTML += '</ul>';

    this.getJsonInfo().then(() => {
      this.allData.forEach((element, index) => {
        if (element.questions.length > 0) {
          if (!alreadyTitle.includes(element.sectionTitle)) {
            alreadyTitle.push(element.sectionTitle);
            document.getElementById('pia-htmlBlock-content').innerHTML += '<h1>' + element.sectionTitle + '</h1>';
          }
          document.getElementById('pia-htmlBlock-content').innerHTML += '<h2>' + element.itemTitle + '</h2>';
          element.questions.forEach(question => {
            document.getElementById('pia-htmlBlock-content').innerHTML += '<p>';
            document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>' + question.title + '</strong><br>';
            document.getElementById('pia-htmlBlock-content').innerHTML += question.content;
            document.getElementById('pia-htmlBlock-content').innerHTML += '</p>';
          });
        }
      });
    });
    this._modalsService.openModal('pia-htmlBlock');
  }

  private prepareHeader() {
    document.getElementById('pia-htmlBlock-content').innerHTML += '<h1>Informations du PIA</h1>';

    if (this.pia.name && this.pia.name.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Nom du Pia : </strong>'
        + this.pia.name + '<br>';
    }
    if (this.pia.author_name && this.pia.author_name.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Nom de l\'auteur : </strong>'
        + this.pia.author_name + '<br>';
    }
    if (this.pia.evaluator_name && this.pia.evaluator_name.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Nom de l\'évaluateur : </strong>'
        + this.pia.evaluator_name + '<br>';
    }
    if (this.pia.validator_name && this.pia.validator_name.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Nom du validateur : </strong>'
        + this.pia.validator_name + '<br>';
    }

    if (this.pia.dpos_names && this.pia.dpos_names.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Nom du DPO : </strong>'
        + this.pia.dpos_names + '<br>';
    }
    if ( this.pia.dpo_status >= 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Statut du DPO : </strong>'
        + this.pia.getOpinionsStatus(this.pia.dpo_status.toString()) + '<br>';
    }
    if (this.pia.dpo_opinion && this.pia.dpo_opinion.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Opinion du DPO : </strong>'
        + this.pia.dpo_opinion + '<br>';
    }

    if (this.pia.people_names && this.pia.people_names.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Nom des personnes concernées : </strong>'
        + this.pia.people_names + '<br>';
    }
    if (this.pia.concerned_people_status >= 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Statut des personnes concernées : </strong>'
        + this.pia.getOpinionsStatus(this.pia.concerned_people_status.toString()) + '<br>';
    }
    if (this.pia.concerned_people_opinion && this.pia.concerned_people_opinion.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Opinion des personnes concernées : </strong>'
        + this.pia.concerned_people_opinion + '<br>';
    }

    if (this.pia.applied_adjustements && this.pia.applied_adjustements.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Modifications apportées : </strong>'
        + this.pia.applied_adjustements + '<br>';
    }
    if (this.pia.rejected_reason && this.pia.rejected_reason.length > 0) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Raison du refus : </strong>'
        + this.pia.rejected_reason + '<br>';
    }
    if (this.pia.created_at) {
      document.getElementById('pia-htmlBlock-content').innerHTML += '<strong>Date de création : </strong>'
        + this.pia.created_at + '<br><br>';
    }
  }

  private getJsonInfo() {
    this.allData = [];
    return new Promise((resolve, reject) => {
      this.data.sections.forEach((section) => {
        section.items.forEach((item) => {
          const ref = section.id.toString() + item.id.toString();
          this.allData[ref] = {
            sectionTitle: section.title,
            itemTitle: item.title,
            questions: []
          }
          if (item.is_measure) {
            const measuresModel = new Measure();
            measuresModel.pia_id = this.pia.id;
            measuresModel.findAll().then((entries: any) => {
              entries.forEach((measure) => {
                if (measure.title !== undefined && measure.content !== undefined) {
                  this.allData[ref]['questions'].push({
                    title: measure.title,
                    content: measure.content
                  });
                }
              });
            });
          } else if (item.questions) {
            item.questions.forEach((question) => {
              const answerModel = new Answer();
              answerModel.getByReferenceAndPia(this.pia.id, question.id).then(() => {
                if (answerModel.data) {
                  let content = null;
                  if (answerModel.data.gauge && answerModel.data.gauge > 0) {
                    content = this.pia.getGaugeName(answerModel.data.gauge);
                  }
                  if (answerModel.data.text && answerModel.data.text.length > 0) {
                    content = answerModel.data.text;
                  }
                  if (answerModel.data.list && answerModel.data.list.length > 0) {
                    content = answerModel.data.list.join(', ');
                  }
                  if (content) {
                    this.allData[ref]['questions'].push({
                      title: question.title,
                      content: content
                    });
                  }
                }
                if (section.id === 3 && item.id === 4) {
                  resolve();
                }
              });
            });
          }
        });
      });
    });
  }

  private getJsonInfo_OLD() {
    // this._actionPlanService.pia = this.pia;
    // this._actionPlanService.listActionPlan();
  }








  // downloadActionPlan() {
  //   const doc = new jsPDF();
  //   doc.setFontSize(12);
  //   let i = 1;
  //   doc.setFontStyle('bold');
  //   doc.text('Principes fondamentaux', 10, i * 10);
  //   doc.setFontStyle('normal');
  //   i++;

  //   // TODO - Add estimated_evaluation_date and person_in_charge data

  //   if (this._actionPlanService.noPrinciplesActionPlan) {
  //     doc.text('Aucun plan d\'action enregistré.', 10, i * 10);
  //     i++;
  //   } else {
  //     this._actionPlanService.results.forEach((data: any) => {
  //       i++;
  //       if (i === 34) {
  //        // Add a new page every 34 lines
  //         i = 1;
  //         doc.addPage();
  //       }
  //       doc.text(data.short_title, 10, i * 10);
  //       i++;
  //       // Add a new line every 90 characters
  //       const entry = data.evaluation.action_plan_comment.replace(/(.{90})/g, '$1\n');
  //       const count = (entry.match(new RegExp('\n', 'g')) || []).length;

  //       doc.text(entry, 10, i * 10);
  //       i += count;
  //     });
  //   }
  //   doc.setFontStyle('bold');
  //   doc.text('Mesures existantes ou prévues', 10, i * 10);
  //   doc.setFontStyle('normal');
  //   i++;
  //   if (this._actionPlanService.noMeasuresActionPlan) {
  //     doc.text('Aucun plan d\'action enregistré.', 10, i * 10);
  //     i++;
  //   } else {
  //     this._actionPlanService.measures.forEach((data: any) => {
  //       i++;
  //       if (i === 34) {
  //        // Add a new page every 34 lines
  //         i = 1;
  //         doc.addPage();
  //       }
  //       doc.text(data.short_title, 10, i * 10);
  //       i++;
  //       // Add a new line every 90 characters
  //       const entry = data.evaluation.action_plan_comment.replace(/(.{90})/g, '$1\n');
  //       const count = (entry.match(new RegExp('\n', 'g')) || []).length;

  //       doc.text(entry, 10, i * 10);
  //       i += count;
  //     });
  //   }
  //   doc.setFontStyle('bold');
  //   doc.text('Risques', 10, i * 10);
  //   doc.setFontStyle('normal');
  //   i++;
  //   if (this._actionPlanService.noRisksActionPlan) {
  //     doc.text('Aucun plan d\'action enregistré.', 10, i * 10);
  //     i++;
  //   } else {
  //     if (this._actionPlanService.risks['3.2'] && this._actionPlanService.risks['3.2'].action_plan_comment) {
  //       if (this._actionPlanService.risks['3.2'].short_title) {
  //         doc.text(this._actionPlanService.risks['3.2'].short_title, 10, i * 10);
  //         i++;
  //       }
  //       const entry = this._actionPlanService.risks['3.2'].action_plan_comment.replace(/(.{90})/g, '$1\n');
  //       const count = (entry.match(new RegExp('\n', 'g')) || []).length;
  //       doc.text(entry, 10, i * 10);
  //       i += count;
  //     }
  //     if (this._actionPlanService.risks['3.3'] && this._actionPlanService.risks['3.3'].action_plan_comment) {
  //       if (this._actionPlanService.risks['3.3'].short_title) {
  //         doc.text(this._actionPlanService.risks['3.3'].short_title, 10, i * 10);
  //         i++;
  //       }
  //       const entry = this._actionPlanService.risks['3.3'].action_plan_comment.replace(/(.{90})/g, '$1\n');
  //       const count = (entry.match(new RegExp('\n', 'g')) || []).length;
  //       doc.text(entry, 10, i * 10);
  //       i += count;
  //     }
  //     if (this._actionPlanService.risks['3.4'] && this._actionPlanService.risks['3.4'].action_plan_comment) {
  //       if (this._actionPlanService.risks['3.4'].short_title) {
  //         doc.text(this._actionPlanService.risks['3.4'].short_title, 10, i * 10);
  //         i++;
  //       }
  //       const entry = this._actionPlanService.risks['3.4'].action_plan_comment.replace(/(.{90})/g, '$1\n');
  //       const count = (entry.match(new RegExp('\n', 'g')) || []).length;
  //       doc.text(entry, 10, i * 10);
  //       i += count;
  //     }
  //     if (i === 34) {
  //       // Add a new page every 34 lines
  //       i = 1;
  //       doc.addPage();
  //     }
  //   }
  //   doc.save('action_plan_' + this.pia.id + '.pdf');
  // }
}
