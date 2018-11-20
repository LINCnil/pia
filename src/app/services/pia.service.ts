import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Http } from '@angular/http';


import { Pia } from 'app/entry/pia.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Comment } from 'app/entry/entry-content/comments/comment.model';
import { Attachment } from 'app/entry/attachments/attachment.model';
import { Structure } from 'app/structures/structure.model';

import { AppDataService } from 'app/services/app-data.service';
import { ModalsService } from 'app/modals/modals.service';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';

@Injectable()
export class PiaService {

  pias = [];
  pia: Pia = new Pia();
  answer: Answer = new Answer();
  data: { sections: any };

  constructor(private _router: Router, private route: ActivatedRoute,
              private _appDataService: AppDataService,
              private _modalsService: ModalsService, private http: Http) {
                this._appDataService.getDataNav().then((dataNav) => {
                  this.data = dataNav;
                });
              }

  /**
   * Get the PIA.
   * @return {Promise}
   * @memberof PiaService
   */
  async getPIA() {
    return new Promise((resolve, reject) => {
      const piaId = parseInt(this.route.snapshot.params['id'], 10);
      this.pia.get(piaId).then(() => {
        resolve();
      });
    });
  }

  async calculProgress() {
    this.pias.forEach((pia: Pia) => {
      this.calculPiaProgress(pia);
    });
  }

  calculPiaProgress(pia: Pia) {
    let numberElementsToValidate = 1;
    this.data.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.questions) {
          numberElementsToValidate += item.questions.length;
        }
      });
    });
    const answer = new Answer();
    let numberElementsValidated = 0;
    answer.findAllByPia(pia.id).then((answers: any) => {
      numberElementsValidated += answers.length;
      if (pia.status > 1) {
        numberElementsValidated += 1;
      }
      const measure = new Measure();
      measure.pia_id = pia.id;
      measure.findAll().then((measures: any) => {
        numberElementsToValidate += measures.length;
        numberElementsValidated += measures.length;
        // const evaluation = new Evaluation();
        // evaluation.pia_id = pia.id;
        // evaluation.findAll().then((evaluations: any) => {
        //   numberElementsValidated += evaluations.length;
        //   numberElementsToValidate *= 2;
          pia.progress = Math.round((100 / numberElementsToValidate) * numberElementsValidated);
        // });
      });
    });
  }

  /**
   * Create a new PIA
   * @memberof PiaService
   */
  async saveNewPia(piaForm: any) {
    return new Promise((resolve, reject) => {
      const pia = new Pia();
      pia.name = piaForm.value.name;
      pia.author_name = piaForm.value.author_name;
      pia.evaluator_name = piaForm.value.evaluator_name;
      pia.validator_name = piaForm.value.validator_name;
      const structure_id = piaForm.value.structure;
      if (structure_id && structure_id > 0) {
        const structure = new Structure();
        structure.get(structure_id).then(() => {
          pia.structure_id = structure.id;
          pia.structure_name = structure.name;
          pia.structure_sector_name = structure.sector_name;
          pia.structure_data = this.removeEmptyElements(structure.data);
          pia.create().then((id) => {
            this.structureCreateMeasures(pia, id).then(() => {
              this.structureCreateAnswers(pia, id).then(() => resolve(id));
            });
          });
        });
      } else {
        pia.create().then((id) => resolve(id));
      }
    });
  }

  removeEmptyElements(structure_data) {
    structure_data.sections.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          if (item.is_measure) {
            if (item.answers && item.answers.length > 0) {
              let index = 0;
              item.answers.forEach(answer => {
                if (answer && answer.title.length <= 0) {
                  item.answers.splice(index, 1);
                }
                index++;
              });
            }
          } else if (item.questions) {
            item.questions.forEach(question => {
              if (question.answer && question.answer.length > 0 && question.answer.title && question.answer.title.length <= 0) {
                const index = item.questions.findIndex(q => q.id === question.id);
                item.questions.splice(index, 1);
              }
            });
          }
        });
      }
    });
    return structure_data;
  }

  async structureCreateMeasures(pia: Pia, id: any) {
    return new Promise((resolve, reject) => {
      // Record the structures Measures
      const structures_measures = pia.structure_data.sections.filter(s => s.id === 3)[0].items.filter(i => i.id === 1)[0].answers;
      let i = 0;
      if (structures_measures.length > 0) {
        for (const m in structures_measures) {
          if (structures_measures.hasOwnProperty(m) && structures_measures[m]) {
            const measure = new Measure();
            measure.pia_id = id;
            measure.title = structures_measures[m].title;
            measure.content = structures_measures[m].content;
            measure.create().then(() => {
              i++;
              if (i === structures_measures.length) {
                resolve();
              }
            });
          }
        }
      } else {
        resolve();
      }
    });
  }

  async structureCreateAnswers(pia: Pia, id: any) {
    // Record the structures Answers
    return new Promise((resolve, reject) => {
      const questions = [];
      pia.structure_data.sections.forEach(section => {
        if (section.items) {
          section.items.forEach(item => {
            if (item.questions) {
              item.questions.forEach(question => {
                if (question.answer && question.answer.length > 0) {
                  questions.push(question);
                }
              });
            }
          });
        }
      });

      if (questions.length > 0) {
        let i = 0;
        questions.forEach(question => {
          const answer = new Answer();
          answer.pia_id = id;
          answer.reference_to = question.id;
          answer.data = { text: question.answer, gauge: null, list: null };
          answer.create().then(() => {
            i++;
            if (i === questions.length) {
              resolve();
            }
          });
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Allows an user to remove a PIA.
   * @memberof PiaService
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
      document.querySelector('.pia-cardsBlock.pia[data-id="' + piaID + '"]').remove();
    }

    localStorage.removeItem('pia-id');
    this._modalsService.closeModal();
  }

  /**
   * Cancel all validated evaluations.
   * @returns {Promise}
   * @memberof PiaService
   */
  async cancelAllValidatedEvaluation() {
    return new Promise((resolve, reject) => {
      let count = 0;
      let evaluation = new Evaluation();
      evaluation.pia_id = this.pia.id;
      evaluation.findAll().then((entries: any) => {
        if (entries && entries.length > 0) {
          entries.forEach(element => {
            evaluation = new Evaluation();
            evaluation.get(element.id).then((entry: any) => {
              entry.global_status = 0;
              entry.update().then(() => {
                count++;
                if (count === entries.length) {
                  resolve();
                }
              });
            });
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Allows an user to abandon a treatment (archive a PIA).
   * @memberof PiaService
   */
  abandonTreatment() {
    this.pia.status = 4;
    this.pia.update().then(() => {
      this._modalsService.closeModal();
      this._router.navigate(['home']);
    });
  }

  /**
   * Allow an user to duplicate a PIA.
   * @param {number} id - The PIA id.
   * @memberof PiaService
   */
  duplicate(id: number) {
    this.exportData(id).then((data) => {
      this.importData(data, 'COPY', true);
    });
  }

  /**
   * Allow an user to export a PIA.
   * @param {number} id - The PIA id.
   * @returns {Promise}
   * @memberof PiaService
   */
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

  /**
   * Allow an user to import a PIA.
   * @param {*} data - Data PIA.
   * @param {string} prefix - A title prefix.
   * @param {boolean} is_duplicate - Is a duplicate PIA?
   * @param {boolean} [is_example] - Is the PIA example?
   * @memberof PiaService
   */
  async importData(data: any, prefix: string, is_duplicate: boolean, is_example?: boolean) {
    if (!('pia' in data) || !('dbVersion' in data.pia)) {
      this._modalsService.openModal('import-wrong-pia-file');
      return;
    }
    const pia = new Pia();
    pia.name = '(' + prefix + ') ' + data.pia.name;
    pia.author_name = data.pia.author_name;
    pia.evaluator_name = data.pia.evaluator_name;
    pia.validator_name = data.pia.validator_name;
    pia.dpo_status = data.pia.dpo_status;
    pia.dpo_opinion = data.pia.dpo_opinion;
    pia.concerned_people_opinion = data.pia.concerned_people_opinion;
    pia.concerned_people_status = data.pia.concerned_people_status;
    pia.concerned_people_searched_opinion = data.pia.concerned_people_searched_opinion;
    pia.concerned_people_searched_content = data.pia.concerned_people_searched_content;
    pia.rejected_reason = data.pia.rejected_reason;
    pia.applied_adjustements = data.pia.applied_adjustements;
    pia.created_at = data.pia.created_at;
    pia.dpos_names = data.pia.dpos_names;
    pia.people_names = data.pia.people_names;
    /* Structure import if there is a specific one associated to this PIA */
    if (data.pia.structure_id) {
      pia.structure_id = data.pia.structure_id;
      pia.structure_data = data.pia.structure_data;
      pia.structure_name = data.pia.structure_name;
      pia.structure_sector_name = data.pia.structure_sector_name;

    }

    /* Set this PIA as the example PIA if needed, else default value affected on creation */
    if (is_example) {
      pia.is_example = 1;
    }

    if (is_duplicate) {
      pia.status = 0;
      pia.created_at = new Date();
      pia.updated_at = new Date();
      pia.dpos_names = null;
      pia.dpo_status = null;
      pia.dpo_opinion = null;
      pia.concerned_people_searched_opinion = null;
      pia.concerned_people_searched_content = null;
      pia.people_names = null;
      pia.concerned_people_status = null;
      pia.concerned_people_opinion = null;
    } else {
      pia.status = parseInt(data.pia.status, 10);
      if (Number.isNaN(pia.status)) {
        pia.status = 0;
      }
      pia.created_at = new Date(data.pia.created_at);
      if (data.pia.updated_at) {
        pia.updated_at = new Date(data.pia.updated_at);
      }
    }

    pia.create().then((pia_id: number) => {
      pia.id = pia_id;
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

      if (data.measures.length > 0) {
        let count = 0;
        const oldIdToNewId = [];
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
          measureModel.create().then((id: number) => {
            count++;
            oldIdToNewId[measure.id] = id;
            if (count === data.measures.length) {
              this.importEvaluations(data, pia_id, is_duplicate, oldIdToNewId);
            }
          });
        });
      } else {
        this.importEvaluations(data, pia_id, is_duplicate);
      }

      if (!is_duplicate) {
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
      }

      this.pias.push(pia);
      this.calculPiaProgress(pia);
    });
  }

  /**
   * Import all evaluations.
   * @private
   * @param {*} data - Data PIA.
   * @param {number} pia_id - The PIA id.
   * @param {boolean} is_duplicate - Is a duplicated PIA?
   * @param {Array<any>} [oldIdToNewId] - Array to generate new id for special item.
   * @memberof PiaService
   */
  private importEvaluations(data: any, pia_id: number, is_duplicate: boolean, oldIdToNewId?: Array<any>) {
    if (!is_duplicate) {
      // Create evaluations
      data.evaluations.forEach(evaluation => {
        const evaluationModel = new Evaluation();
        evaluationModel.pia_id = pia_id;
        evaluationModel.status = evaluation.status;
        let reference_to = evaluation.reference_to;
        if (reference_to.startsWith('3.1') && oldIdToNewId) {
          const ref = reference_to.split('.')
          if (oldIdToNewId[ref[2]]) {
            reference_to = '3.1.' + oldIdToNewId[ref[2]];
          }
        }
        evaluationModel.reference_to = reference_to;
        evaluationModel.action_plan_comment = evaluation.action_plan_comment;
        evaluationModel.evaluation_comment = evaluation.evaluation_comment;
        if (evaluation.evaluation_date) {
          evaluationModel.evaluation_date = new Date(evaluation.evaluation_date);
        }
        evaluationModel.gauges = evaluation.gauges;
        if (evaluation.estimated_implementation_date) {
          evaluationModel.estimated_implementation_date = new Date(evaluation.estimated_implementation_date);
        }
        evaluationModel.person_in_charge = evaluation.person_in_charge;
        evaluationModel.global_status = evaluation.global_status;
        evaluationModel.created_at = new Date(evaluation.created_at);
        if (evaluation.updated_at) {
          evaluationModel.updated_at = new Date(evaluation.updated_at);
        }
        evaluationModel.create();
      });
    }
  }

  /**
   * Download the PIA exported.
   * @param {number} id - The PIA id.
   * @memberof PiaService
   */
  export(id: number) {
    const date = new Date().getTime();
    this.exportData(id).then((data) => {
      const a = document.getElementById('pia-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_pia_' + id + '.json');
      const event = new MouseEvent('click', {
        view: window
      });
      a.dispatchEvent(event);
    });
  }

  /**
   * Import the PIA from file.
   * @param {*} file - The exported PIA file.
   * @memberof PiaService
   */
  async import(file: any) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (event: any) => {
      const jsonFile = JSON.parse(event.target.result);
      this.importData(jsonFile, 'IMPORT', false);
    }
  }
}
