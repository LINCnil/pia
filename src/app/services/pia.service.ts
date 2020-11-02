import { Injectable, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { utf8Encode } from '@angular/compiler/src/util';


import { AppDataService } from 'src/app/services/app-data.service';

import { SidStatusService } from 'src/app/services/sid-status.service';
import { Answer } from '../models/answer.model';
import { Evaluation } from '../models/evaluation.model';
import { Measure } from '../models/measure.model';
import { Pia } from '../models/pia.model';
import { Comment } from '../models/comment.model';
import { Structure } from '../models/structure.model';
import { ModalsService } from './modals.service';
import { StructureService } from './structure.service';
import { AnswerService } from './answer.service';
import { ApplicationDb } from '../application.db';

@Injectable()
export class PiaService extends ApplicationDb  {
  pias = [];
  pia: Pia = new Pia();
  answer: Answer = new Answer();
  data: { sections: any };
  @Output() piaEvent = new EventEmitter<Pia>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public _appDataService: AppDataService,
    private modalsService: ModalsService,
    public _sidStatusService: SidStatusService,
    private structureService: StructureService,
    private answerService: AnswerService
  ) {
    super(201910230914, 'pia');
    if (this.pia.structure_data) {
      this._appDataService.dataNav = this.pia.structure_data;
    } else {
      this._appDataService.resetDataNav();
    }

    this.data = this._appDataService.dataNav;
  }

  /**
   * Get the PIA.
   * @return - Return a new Promise
   */
  async getPIA() {
    return new Promise((resolve, reject) => {
      const piaId = parseInt(this.route.snapshot.params.id, 10);
      if (piaId) {
        this.pia.get(piaId).then(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async calculProgress() {
    this.pias.forEach((pia: Pia) => {
      this.calculPiaProgress(pia);
    });
  }

  async calculPiaProgress(pia) {
    pia.progress = 0.0;
    if (pia.status > 0) {
      pia.progress += 4;
    }
    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        this._sidStatusService.setSidStatus(pia, section, item);
      });
    });
  }

  /**
   * Create a new PIA
   */
  async saveNewPia(piaForm: any) {
    return new Promise((resolve, reject) => {
      const pia = new Pia();
      pia.name = piaForm.value.name;
      pia.category = piaForm.value.category;
      pia.author_name = piaForm.value.author_name;
      pia.evaluator_name = piaForm.value.evaluator_name;
      pia.validator_name = piaForm.value.validator_name;
      pia.created_at = new Date();
      pia.updated_at = new Date();
      const structure_id = piaForm.value.structure;
      if (structure_id && structure_id > 0) {
        this.structureService.find(structure_id).then((structure: Structure) => {
          pia.structure_id = structure.id;
          pia.structure_name = structure.name;
          pia.structure_sector_name = structure.sector_name;
          pia.structure_data = this.removeEmptyElements(structure.data);
          pia.create().then(id => {
            this.structureCreateMeasures(pia, id).then(() => {
              this.structureCreateAnswers(pia, id).then(() => resolve(id));
            });
          });
        });
      } else {
        pia.create().then(id => resolve(id));
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
          this.answerService.create(answer).then(() => {
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
   * Allows an user to archive a PIA.
   */
  archivePia() {
    const piaID = parseInt(localStorage.getItem('pia-to-archive-id'), 10);

    // Update the PIA in DB.
    const pia = new Pia();
    pia.get(piaID).then(() => {
      pia.is_archive = 1;
      pia.update();

      const index = this.pias.findIndex(item => item.id === piaID);
      if (index !== -1) {
        this.pias[index] = pia;

        this.pias.splice(index, 1);
      }
    });

    // Removes the PIA from the view.
    if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
      document.querySelector('.app-list-item[data-id="' + piaID + '"]').remove();
    } else {
      document.querySelector('.pia-cardsBlock.pia[data-id="' + piaID + '"]').remove();
    }

    localStorage.removeItem('pia-to-archive-id');

    this.modalsService.closeModal();
  }

  /**
   * Cancel all validated evaluations.
   * @returns - Return a new Promise
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
   */
  abandonTreatment() {
    this.pia.status = 4;
    this.pia.update().then(() => {
      this.modalsService.closeModal();
      this.router.navigate(['home']);
    });
  }

  /**
   * Allow an user to duplicate a PIA.
   * @param id - The PIA id.
   */
  duplicate(id: number) {
    this.exportData(id).then(data => {
      this.importData(data, 'COPY', true);
    });
  }

  /**
   * Allow an user to export a PIA.
   * @param id - The PIA id.
   * @returns - Return a new Promise
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
        // SET progress attribute
        this.calculPiaProgress(pia);
        const data = {
          pia: pia,
          answers: null,
          measures: null,
          evaluations: null,
          comments: null
        };
        this.answerService.findAllByPia(id).then(answers => {
          data['answers'] = answers;
          measure.findAll().then(measures => {
            data['measures'] = measures;
            evaluation.findAll().then(evaluations => {
              data['evaluations'] = evaluations;
              comment.findAll().then(comments => {
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
   * @param data - Data PIA.
   * @param prefix - A title prefix.
   * @param is_duplicate - Is a duplicate PIA?
   * @param [is_example] - Is the PIA example?
   */
  async importData(data: any, prefix: string, is_duplicate: boolean, is_example?: boolean) {
    if (!('pia' in data) || !('dbVersion' in data.pia)) {
      this.modalsService.openModal('import-wrong-pia-file');
      return;
    }
    const pia = new Pia();
    pia.name = '(' + prefix + ') ' + data.pia.name;
    pia.category = data.pia.category;
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

    pia.create().then((piaId: number) => {
      pia.id = piaId;

      this.importAnswers(data.answers, piaId);
      this.importMeasures(data, piaId, is_duplicate);
      if (!is_duplicate) {
        this.importComments(data.comments, piaId);
      }

      this.pias.push(pia);
      this.calculPiaProgress(pia);
    });
  }

  async replacePiaByExport(piaExport, resetOption, updateOption, dateExport) {
    return new Promise(async resolve => {
      const pia = new Pia();
      pia.id = piaExport.pia.id;
      pia.name = piaExport.pia.name;
      pia.category = piaExport.pia.category;
      pia.author_name = piaExport.pia.author_name;
      pia.evaluator_name = piaExport.pia.evaluator_name;
      pia.validator_name = piaExport.pia.validator_name;
      pia.dpo_status = piaExport.pia.dpo_status;
      pia.dpo_opinion = piaExport.pia.dpo_opinion;
      pia.concerned_people_opinion = piaExport.pia.concerned_people_opinion;
      pia.concerned_people_status = piaExport.pia.concerned_people_status;
      pia.concerned_people_searched_opinion = piaExport.pia.concerned_people_searched_opinion;
      pia.concerned_people_searched_content = piaExport.pia.concerned_people_searched_content;
      pia.rejected_reason = piaExport.pia.rejected_reason;
      pia.applied_adjustements = piaExport.pia.applied_adjustements;
      pia.created_at = piaExport.pia.created_at;
      pia.dpos_names = piaExport.pia.dpos_names;
      pia.people_names = piaExport.pia.people_names;
      pia.updated_at = dateExport;
      pia.status = resetOption ? 0 : piaExport.status;
      /* Structure import if there is a specific one associated to this PIA */
      if (piaExport.pia.structure_id) {
        pia.structure_id = piaExport.pia.structure_id;
        pia.structure_data = piaExport.pia.structure_data;
        pia.structure_name = piaExport.pia.structure_name;
        pia.structure_sector_name = piaExport.pia.structure_sector_name;
      }

      if (updateOption) {
        pia
          .update(dateExport) // update pia storage
          .then(async () => {
            // DELETE EVERY ANSWERS, MEASURES AND COMMENT
            await this.destroyData(pia.id);
            // CREATE NEW ANSWERS, MEASURES AND COMMENT
            await this.importAnswers(piaExport.answers, pia.id);
            await this.importMeasures(piaExport, pia.id, false);
            await this.importComments(piaExport.comments, pia.id);
            resolve();
          });
      } else {
        resolve();
      }
    });
  }

  /**
   * Import all evaluations.
   * @param data - Data PIA.
   * @param pia_id - The PIA id.
   * @param is_duplicate - Is a duplicated PIA?
   * @param [oldIdToNewId] - Array to generate new id for special item.
   * @param resetStatus - Used to erase the PIA status
   */
  private async importEvaluations(data: any, pia_id: number, is_duplicate: boolean, oldIdToNewId?: Array<any>, resetStatus?: boolean) {
    if (!is_duplicate) {
      // Create evaluations
      for (const evaluation of data.evaluations) {
        const evaluationModel = new Evaluation();
        evaluationModel.pia_id = pia_id;
        evaluationModel.status = resetStatus ? 0 : evaluation.status;
        let reference_to = evaluation.reference_to;
        if (reference_to.startsWith('3.1') && oldIdToNewId) {
          const ref = reference_to.split('.');
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
        await evaluationModel.create().then(() => {
          console.log('finish create evaluation');
        });
      }
    }
  }

  /**
   * Make a JSON from the PIA data
   * @param id - The PIA id.
   */
  async export(id: number) {
    return new Promise(async (resolve, reject) => {
      this.exportData(id).then(data => {
        const finalData = utf8Encode(JSON.stringify(data));
        resolve(finalData);
      });
    });
  }

  /**
   * Import the PIA from file.
   * @param file - The exported PIA file.
   */
  async import(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (event: any) => {
        try {
          const jsonFile = JSON.parse(event.target.result);
          this.importData(jsonFile, 'IMPORT', false);
          resolve(true);
        } catch (error) {
          // this.modalsService.openModal('modal-general-error');
          // console.error('Unable to parse JSON file.');
          reject(error);
        }
      };
    });
  }

  /**
   * Destroy all PIA data (answers, comments, measure, evaluations)
   * @param piaId - The PIA id
   */
  private async destroyData(piaId: number) {
    const answer = new Answer();
    answer.pia_id = piaId;
    await this.answerService.findAllByPia(piaId).then(async (response: Array<Answer>) => {
      for (const c of response) {
        await this.answerService.delete(c.id);
      }
    });

    const comment = new Comment();
    comment.pia_id = piaId;
    await comment.findAllByPia(piaId).then(async (response: Array<Comment>) => {
      for (const c of response) {
        await comment.delete(c.id);
      }
    });

    const measure = new Measure();
    measure.pia_id = piaId;
    await measure.findAllByPia(piaId).then(async (response: Array<Comment>) => {
      for (const c of response) {
        await measure.delete(c.id);
      }
    });

    const evaluation = new Evaluation();
    evaluation.pia_id = piaId;
    await evaluation.findAllByPia(piaId).then(async (response: Array<Comment>) => {
      for (const c of response) {
        await evaluation.delete(c.id);
      }
    });
  }

  /**
   * Import all answers
   * @param answers - The list of answers
   * @param piaId - The PIA id
   */
  private async importAnswers(answers: any, piaId: number) {
    answers.forEach(answer => {
      const answerModel = new Answer();
      answerModel.pia_id = piaId;
      answerModel.reference_to = answer.reference_to;
      answerModel.data = answer.data;
      answerModel.created_at = new Date(answer.created_at);
      if (answer.updated_at) {
        answerModel.updated_at = new Date(answer.updated_at);
      }
      this.answerService.create(answerModel);
    });
  }

  /**
   * Import all measures
   * @param data - The entire PIA with evaluations
   * @param piaId - The PIA id
   * @param isDuplicate - To know if it's a duplication action
   * @param resetStatus - To know if we need to reset the status
   */
  private async importMeasures(data: any, piaId: number, isDuplicate: boolean, resetStatus?: boolean) {
    if (data.measures.length > 0) {
      let count = 0;
      const oldIdToNewId = [];
      // Create measures
      data.measures.forEach(measure => {
        const measureModel = new Measure();
        measureModel.title = measure.title;
        measureModel.pia_id = piaId;
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
            this.importEvaluations(data, piaId, isDuplicate, oldIdToNewId, resetStatus);
          }
        });
      });
    } else {
      this.importEvaluations(data, piaId, isDuplicate, null, resetStatus);
    }
  }

  // UPDATE
  archive(id): Promise<void> {
    return new Promise((resolve, reject) => {

      // Update the PIA in DB.
      const pia = new Pia();
      pia.get(id)
        .then(() => {
          pia.is_archive = 1;
          pia.update();

          const index = this.pias.findIndex(item => item.id === id);
          if (index !== -1) {
            this.pias[index] = pia;
            this.pias.splice(index, 1);
          }
          localStorage.removeItem('pia-to-archive-id');
          resolve();
        })
        .catch(err => {
          console.error(err);
        });
    });
  }


  // END UPDATe

  /**
   * Import all comments
   * @param comments - The list of comments
   * @param piaId - The PIA id
   */
  private async importComments(comments: any, piaId: number) {
    comments.forEach(comment => {
      const commentModel = new Comment();
      commentModel.pia_id = piaId;
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
}
