import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Http } from '@angular/http';

import { AppDataService } from 'app/services/app-data.service';
import { Pia } from './pia.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Comment } from 'app/entry/entry-content/comments/comment.model';
import { Attachment } from 'app/entry/attachments/attachment.model';

import { ModalsService } from 'app/modals/modals.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';

@Injectable()
export class PiaService {

  pias: any[];
  pia: Pia = new Pia();
  answer: Answer = new Answer();
  data: { sections: any };

  constructor(private _router: Router, private route: ActivatedRoute,
              private _evaluationService: EvaluationService,
              private _appDataService: AppDataService,
              private _modalsService: ModalsService, private http: Http) {
                this._appDataService.getDataNav().then((dataNav) => {
                  this.data = dataNav;
                });
              }

  /**
   * Gets the PIA.
   * @return the PIA object.
   */
  async getPIA() {
    return new Promise((resolve, reject) => {
      const piaId = parseInt(this.route.snapshot.params['id'], 10);
      this.pia.get(piaId).then(() => {
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

    // Deletes the PIA from the view.
    if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
      document.querySelector('.app-list-item[data-id="' + piaID + '"]').remove();
    } else {
      document.querySelector('.pia-cardsBlock.pia-doingBlock[data-id="' + piaID + '"]').remove();
    }

    localStorage.removeItem('pia-id');
    this._modalsService.closeModal();
  }

  async cancelAllValidatedEvaluation() {
    return new Promise((resolve, reject) => {
      let evaluation = new Evaluation();
      evaluation.pia_id = this._evaluationService.pia.id;
      evaluation.findAll().then((entries: any) => {
        entries.forEach(element => {
          evaluation = new Evaluation();
          evaluation.get(element.id).then((entry: any) => {
            /* TODO : entry.status = 0; */
            entry.global_status = 0;
            entry.update();
          });
        });
        resolve();
      });
    });
  }

  /**
   * Allows an user to abandon a treatment (archive a PIA)
   */
  abandonTreatment() {
    this.pia.status = 4;
    this.pia.update().then(() => {
      this._modalsService.closeModal();
      this._router.navigate(['home']);
    });
  }

  duplicate(id: number) {
    this.exportData(id).then((data) => {
      this.importData(data, 'COPY');
    });
  }

  exportData(id: number) {
    return new Promise((resolve, reject) => {
      const pia = new Pia();
      const answer = new Answer();
      const measure = new Measure();
      measure.pia_id = id;
      const evaluation = new Evaluation();
      evaluation.pia_id = id;
      const comment = new Comment();
      comment.pia_id = id;
      // const attachment = new Attachment();
      // attachment.pia_id = id;
      pia.get(id).then(() => {
        const data = {
          pia: pia,
          answers: null,
          measures: null,
          evaluations: null,
          comments: null
        }
        answer.findAllByPia(id).then((answers) => {
          data['answers'] = answers;
          measure.findAll().then((measures) => {
            data['measures'] = measures;
            evaluation.findAll().then((evaluations) => {
              data['evaluations'] = evaluations;
              comment.findAll().then((comments) => {
                data['comments'] = comments;
                // attachment.findAll().then((attachments) => {
                  // data['attachments'] = attachments;
                  resolve(data);
                // });
              });
            });
          });
        });
      });
    });
  }

  importData(data: any, prefix: string) {
    const pia = new Pia();
    pia.name = '(' + prefix + ') ' + data.pia.name;
    pia.author_name = data.pia.author_name;
    pia.evaluator_name = data.pia.evaluator_name;
    pia.validator_name = data.pia.validator_name;
    pia.dpo_status = data.pia.dpo_status;
    pia.dpo_opinion = data.pia.dpo_opinion;
    pia.concerned_people_opinion = data.pia.concerned_people_opinion;
    pia.concerned_people_status = data.pia.concerned_people_status;
    pia.rejected_reason = data.pia.rejected_reason;
    pia.applied_adjustements = data.pia.applied_adjustements;
    pia.created_at = data.pia.created_at;
    pia.dpos_names = data.pia.dpos_names;
    pia.people_names = data.pia.people_name;
    pia.created_at = new Date(data.pia.created_at);
    if (data.pia.updated_at) {
      pia.updated_at = new Date(data.pia.updated_at);
    }
    pia.create().then((pia_id: number) => {
      // Create answers
      data.answers.forEach(answer => {
        const answerModel = new Answer();
        answerModel.pia_id = pia_id;
        answerModel.reference_to = answer.reference_to;
        answerModel.data = answer.data;
        answerModel.created_at = new Date(answer.created_at);
        if (answer.updated_at) {
          answerModel.updated_at = new Date(answer.updated_at);
        }
        answerModel.create();
      });

      // Create measures
      data.measures.forEach(measure => {
        const measureModel = new Measure();
        measureModel.title = measure.title;
        measureModel.pia_id = pia_id;
        measureModel.content = measure.content;
        measureModel.placeholder = measure.placeholder;
        measureModel.created_at = new Date(measure.created_at);
        if (measure.updated_at) {
          measureModel.updated_at = new Date(measure.updated_at);
        }
        measureModel.create();
      });

      // Create evaluations
      data.evaluations.forEach(evaluation => {
        const evaluationModel = new Evaluation();
        evaluationModel.pia_id = pia_id;
        evaluationModel.status = evaluation.status;
        evaluationModel.reference_to = evaluation.reference_to;
        evaluationModel.action_plan_comment = evaluation.action_plan_comment;
        evaluationModel.evaluation_comment = evaluation.evaluation_comment;
        evaluationModel.evaluation_date = new Date(evaluation.evaluation_date);
        evaluationModel.gauges = evaluation.gauges;
        evaluationModel.estimated_implementation_date = new Date(evaluation.estimated_implementation_date);
        evaluationModel.person_in_charge = evaluation.person_in_charge;
        evaluationModel.global_status = 0;
        evaluationModel.created_at = new Date(evaluation.created_at);
        if (evaluation.updated_at) {
          evaluationModel.updated_at = new Date(evaluation.updated_at);
        }
        evaluationModel.create();
      });

      // Create comments
      data.comments.forEach(comment => {
        const commentModel = new Comment();
        commentModel.pia_id = pia_id;
        commentModel.description = comment.description;
        commentModel.reference_to = comment.reference_to;
        commentModel.for_measure = comment.for_measure;
        commentModel.created_at = new Date(comment.created_at);
        if (comment.updated_at) {
          commentModel.updated_at = new Date(comment.updated_at);
        }
        commentModel.create();
      });

      this.pias.push(pia);
    });
  }

  export(id:  number) {
    const date = new Date().getTime();
    this.exportData(id).then((data) => {
      const a = document.getElementById('pia-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_pia_' + id + '.json');
      a.click();
    });
  }

  async import(file: any) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (event: any) => {
      const jsonFile = JSON.parse(event.target.result);
      this.importData(jsonFile, 'IMPORT');
    }
  }
}
