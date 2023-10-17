import { Injectable, EventEmitter, Output } from '@angular/core';

import { AppDataService } from 'src/app/services/app-data.service';

import { SidStatusService } from 'src/app/services/sid-status.service';
import { Answer } from '../models/answer.model';
import { Evaluation } from '../models/evaluation.model';
import { Measure } from '../models/measure.model';
import { Pia } from '../models/pia.model';
import { Comment } from '../models/comment.model';
import { Structure } from '../models/structure.model';
import { StructureService } from './structure.service';
import { AnswerService } from './answer.service';
import { ApplicationDb } from '../application.db';
import { Router } from '@angular/router';

import piaExample from 'src/assets/files/2018-02-21-pia-example.json';
import { MeasureService } from './measures.service';
import { CommentsService } from './comments.service';
import { EvaluationService } from './evaluation.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

function encode_utf8(s): string {
  return unescape(encodeURIComponent(s));
}

@Injectable()
export class PiaService extends ApplicationDb {
  answer: Answer = new Answer();
  data: { sections: any };
  @Output() piaEvent = new EventEmitter<Pia>();

  constructor(
    private router: Router,
    public appDataService: AppDataService,
    public sidStatusService: SidStatusService,
    private structureService: StructureService,
    private answerService: AnswerService,
    private measuresService: MeasureService,
    private commentsService: CommentsService,
    private evaluationService: EvaluationService,
    private authService: AuthService,
    protected apiService: ApiService
  ) {
    // PREPARE DBS
    super(201910230914, 'pia');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);

    this.data = this.appDataService.dataNav;

    this.authService.currentUser.subscribe({
      complete: () => {
        // there isn't pia ? load it
        this.getPiaExample().then(async examples => {
          if (!examples) {
            await this.importData(piaExample, 'EXAMPLE', false, true);
          }
        });
      }
    });
  }

  /**
   * Find all entries without conditions.
   * @returns {Promise} - Return new Promise
   */
  async getAllActives(): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      this.findAll().then((entries: any) => {
        resolve(
          entries.filter(
            element => element.is_example === 1 || element.is_archive !== 1
          )
        );
      });
    });
  }

  /**
   * Find all archived PIAs
   * @param structure_id the structure id
   */
  async findAllArchives(): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      this.findAll('?is_archive=true', {
        index: 'index5',
        value: 1
      })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get all PIA linked to a specific structure
   * @param structure_id the structure id
   */
  getAllWithStructure(structure_id: number): Promise<Pia[]> {
    const items = [];
    return new Promise((resolve, reject) => {
      this.findAll('?structure_id=' + structure_id, {
        index: 'index4',
        value: structure_id
      })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject(error);
        });
    });
  }

  /**
   * Get the PIA example.
   * @returns {Promise}
   */
  getPiaExample(): Promise<Pia> {
    return new Promise((resolve, reject) => {
      super
        .findWithReference('/example', { index: 'index3', value: 1 })
        .then((resp: Pia) => {
          resolve(resp);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  async calculPiaProgress(pia, update?: boolean): Promise<void> {
    pia.progress = 0.0;
    if (pia.status > 0) {
      pia.progress += 4;
    }

    for (const section of this.data.sections) {
      for (const item of section.items) {
        await this.sidStatusService.setSidStatus(pia, section, item);
      }
    }

    // Prevent outscale value
    pia.progress = pia.progress < 100 ? pia.progress : 100;

    // Save ?
    if (update) {
      await this.update(pia);
    }
  }

  /**
   * Erase all contents on the DPD page.
   * @private
   * @param piaId - The PIA id.
   */
  public resetDpoPage(piaId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(piaId).then((pia: Pia) => {
        pia.dpos_names = null;
        pia.dpo_status = null;
        pia.dpo_opinion = null;
        pia.concerned_people_searched_opinion = null;
        pia.concerned_people_searched_content = null;
        pia.people_names = null;
        pia.concerned_people_status = null;
        pia.concerned_people_opinion = null;
        this.update(pia)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  /**
   * Create a new PIA
   */
  async saveNewPia(piaForm: Pia): Promise<any> {
    return new Promise((resolve, reject) => {
      const pia: Pia = {
        ...piaForm
      };
      pia.is_example = 0;
      pia.status = 0;
      pia.progress = 0;
      pia.created_at = new Date();
      pia.updated_at = new Date();
      const structure_id = piaForm.structure_id;

      if (structure_id && structure_id > 0) {
        this.structureService
          .find(structure_id)
          .then((structure: Structure) => {
            pia.structure_id = structure.id;
            pia.structure_name = structure.name;
            pia.structure_sector_name = structure.sector_name;
            pia.structure_data = this.removeEmptyElements(structure.data);

            super
              .create(pia)
              .then((result: Pia) => {
                this.structureCreateMeasures(pia, result.id).then(() => {
                  this.structureCreateAnswers(pia, result.id).then(() => {
                    resolve(result);
                  });
                });
              })
              .catch(err => {
                reject(err);
              });
          });
      } else {
        super
          .create(pia)
          .then((result: Pia) => {
            resolve(result);
          })
          .catch(err => {
            reject(err);
          });
      }
    });
  }

  removeEmptyElements(structure_data): any {
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
              if (
                question.answer &&
                question.answer.length > 0 &&
                question.answer.title &&
                question.answer.title.length <= 0
              ) {
                const index = item.questions.findIndex(
                  q => q.id === question.id
                );
                item.questions.splice(index, 1);
              }
            });
          }
        });
      }
    });
    return structure_data;
  }

  async structureCreateMeasures(pia: Pia, id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Record the structures Measures
      const structures_measures = pia.structure_data.sections
        .filter(s => s.id === 3)[0]
        .items.filter((item: any) => item.id === 1)[0].answers;
      let i = 0;
      if (structures_measures.length > 0) {
        for (const m in structures_measures) {
          if (structures_measures.hasOwnProperty(m) && structures_measures[m]) {
            const measure = new Measure();
            measure.pia_id = id;
            measure.title = structures_measures[m].title;
            measure.content = structures_measures[m].content;
            this.measuresService.create(measure).then(() => {
              i++;
              if (i === structures_measures.length) {
                resolve(true);
              }
            });
          }
        }
      } else {
        resolve(true);
      }
    });
  }

  async structureCreateAnswers(pia: Pia, id: any): Promise<any> {
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
          this.answerService.create(answer).then(res => {
            i++;
            if (i === questions.length) {
              resolve(res);
            }
          });
        });
      } else {
        resolve(true);
      }
    });
  }

  /**
   * Cancel all validated evaluations.
   * @returns - Return a new Promise
   */
  cancelAllValidatedEvaluation(pia: Pia): Promise<void> {
    return new Promise((resolve, reject) => {
      let count = 0;
      this.evaluationService
        .findAllByPia(pia.id)
        .then((entries: any) => {
          if (entries && entries.length > 0) {
            entries.forEach(element => {
              this.evaluationService.find(element.id).then((entry: any) => {
                entry.global_status = 0;
                this.update(entry).then(() => {
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
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  /**
   * Allows an user to abandon a treatment (archive a PIA).
   */
  abandonTreatment(pia: Pia): Promise<Pia> {
    return new Promise((resolve, reject) => {
      pia.status = 4;
      this.update(pia)
        .then(data => {
          this.router.navigate(['/entries']);
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Allow an user to duplicate a PIA.
   * @param id - The PIA id.
   */
  duplicate(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.exportData(id).then(data => {
        this.importData(data, 'COPY', true)
          .then(res => {
            resolve(res);
          })
          .then(err => {
            reject(err);
          });
      });
    });
  }

  /**
   * Allow an user to export a PIA.
   * @param id - The PIA id.
   * @returns - Return a new Promise
   */
  exportData(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      super.find(id).then(async (pia: Pia) => {
        this.pia_id = id;
        // SET progress attribute
        await this.calculPiaProgress(pia);
        const data = {
          pia,
          answers: null,
          measures: null,
          evaluations: null,
          comments: null
        };

        Promise.all([
          this.answerService.findAllByPia(id),
          this.measuresService.findAllByPia(id),
          this.evaluationService.findAllByPia(id),
          this.commentsService.findAllByPia(id)
        ])
          .then(values => {
            data['answers'] = values[0];
            data['measures'] = values[1];
            data['evaluations'] = values[2];
            data['comments'] = values[3];
            resolve(data);
          })
          .catch(error => {
            console.log(error);
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
  async importData(
    data: any,
    prefix: string,
    is_duplicate: boolean,
    is_example?: boolean
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!data.pia) {
        reject(new Error('wrong pia file'));
        return;
      }

      let pia = new Pia();
      pia.name = '(' + prefix + ') ' + data.pia.name;
      pia.category = data.pia.category;
      pia.dpo_status = data.pia.dpo_status;
      pia.dpo_opinion = data.pia.dpo_opinion;
      pia.concerned_people_opinion = data.pia.concerned_people_opinion;
      pia.concerned_people_status = data.pia.concerned_people_status;
      pia.concerned_people_searched_opinion =
        data.pia.concerned_people_searched_opinion;
      pia.concerned_people_searched_content =
        data.pia.concerned_people_searched_content;
      pia.rejection_reason = data.pia.rejection_reason;
      pia.applied_adjustments = data.pia.applied_adjustments;
      pia.created_at = data.pia.created_at;
      pia.dpos_names = data.pia.dpos_names;
      pia.people_names = data.pia.people_names;

      if (this.authService.state && data.pia.user_pias) {
        pia.user_pias = data.pia.user_pias;
        pia = Pia.formatUsersDatas(pia);
      } else {
        pia.author_name = data.pia.author_name;
        pia.evaluator_name = data.pia.evaluator_name;
        pia.validator_name = data.pia.validator_name;
      }

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

      super
        .create(pia)
        .then(async (result: Pia) => {
          // ADD ID TO QUERIES
          pia.id = result.id;
          this.pia_id = pia.id;
          this.answerService.pia_id = pia.id;
          this.measuresService.pia_id = pia.id;
          this.commentsService.pia_id = pia.id;
          this.evaluationService.pia_id = pia.id;

          await this.importAnswers(data.answers, pia.id);
          await this.importMeasures(data, pia.id, is_duplicate);

          if (!is_duplicate) {
            await this.importComments(data.comments, pia.id);
          }

          await this.calculPiaProgress(pia, true);
          resolve(pia);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  replacePiaByExport(
    piaExport,
    resetOption,
    updateOption,
    dateExport
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let pia = new Pia();
      pia = {
        pia,
        ...piaExport.pia
      };
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
        this.find(pia.id).then((data: Pia) => {
          // Get lock version

          if (data.lock_version) {
            pia.lock_version = data.lock_version;
          }

          if (this.authService.state && pia.user_pias) {
            pia = Pia.formatUsersDatas(pia);
          }

          this.update(pia, dateExport) // update pia storage
            .then(async entry => {
              // DELETE EVERY ANSWERS, MEASURES AND COMMENT
              await this.destroyData(pia.id);
              // CREATE NEW ANSWERS, MEASURES AND COMMENT
              await this.importAnswers(piaExport.answers, pia.id);
              await this.importMeasures(piaExport, pia.id, false);
              await this.importComments(piaExport.comments, pia.id);
              resolve(entry);
            })
            .catch(err => {
              reject(err);
            });
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
  private async importEvaluations(
    data: any,
    pia_id: number,
    is_duplicate: boolean,
    oldIdToNewId?: Array<any>,
    resetStatus?: boolean
  ) {
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
          evaluationModel.evaluation_date = new Date(
            evaluation.evaluation_date
          );
        }
        evaluationModel.gauges = evaluation.gauges;
        if (evaluation.estimated_implementation_date) {
          evaluationModel.estimated_implementation_date = new Date(
            evaluation.estimated_implementation_date
          );
        }
        evaluationModel.person_in_charge = evaluation.person_in_charge;
        evaluationModel.global_status = evaluation.global_status;
        evaluationModel.created_at = new Date(evaluation.created_at);
        if (evaluation.updated_at) {
          evaluationModel.updated_at = new Date(evaluation.updated_at);
        }
        await this.evaluationService.create(evaluationModel);
      }
    }
  }

  /**
   * Make a JSON from the PIA data
   * @param id - The PIA id.
   */
  export(id: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      this.exportData(id).then(data => {
        const finalData = encode_utf8(JSON.stringify(data));
        resolve(finalData);
      });
    });
  }

  /**
   * Import the PIA from file.
   * @param file - The exported PIA file.
   */
  async import(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (event: any) => {
        try {
          const jsonFile = JSON.parse(event.target.result);
          this.importData(jsonFile, 'IMPORT', false)
            .then(() => {
              resolve(true);
            })
            .catch(err => {
              reject(err);
            });
        } catch {
          reject(false);
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
    await this.answerService
      .findAllByPia(piaId)
      .then(async (response: Array<Answer>) => {
        for (const c of response) {
          await this.answerService.delete(c.id);
        }
      });

    const comment = new Comment();
    comment.pia_id = piaId;
    await this.commentsService
      .findAllByPia(piaId)
      .then(async (response: Array<Comment>) => {
        for (const c of response) {
          await this.commentsService.delete(c.id);
        }
      });

    const measure = new Measure();
    measure.pia_id = piaId;
    await this.measuresService
      .findAllByPia(piaId)
      .then(async (response: Array<Comment>) => {
        for (const c of response) {
          await this.measuresService.delete(c.id);
        }
      });

    await this.evaluationService
      .findAllByPia(piaId)
      .then(async (response: Array<Comment>) => {
        for (const c of response) {
          await this.evaluationService.delete(c.id);
        }
      });
  }

  /**
   * Import all answers
   * @param answers - The list of answers
   * @param piaId - The PIA id
   */
  private async importAnswers(answers: any, piaId: number): Promise<void> {
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
  private async importMeasures(
    data: any,
    piaId: number,
    isDuplicate: boolean,
    resetStatus?: boolean
  ): Promise<any> {
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
        this.measuresService.create(measureModel).then((id: number) => {
          count++;
          oldIdToNewId[measure.id] = id;
          if (count === data.measures.length) {
            this.importEvaluations(
              data,
              piaId,
              isDuplicate,
              oldIdToNewId,
              resetStatus
            );
          }
        });
      });
    } else {
      this.importEvaluations(data, piaId, isDuplicate, null, resetStatus);
    }
  }

  // UPDATE
  archive(id): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Update the PIA in DB.
      const pia = new Pia();
      this.find(id)
        .then((entry: Pia) => {
          entry.is_archive = 1;
          this.update(entry).then(() => {
            resolve();
          });
        })
        .catch(err => {
          console.error(err);
        });
    });
  }

  update(pia: Pia, date = null): Promise<any> {
    return new Promise((resolve, reject) => {
      if (pia.is_archive === undefined || pia.is_archive === null) {
        pia.is_archive = 0;
      }
      pia.updated_at = date ? date : new Date();

      // if (this.authService.state && pia.user_pias) {
      //   pia = Pia.formatUsersDatas(pia);
      // }

      super
        .update(pia.id, pia)
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // END UPDATE

  /**
   * Import all comments
   * @param comments - The list of comments
   * @param piaId - The PIA id
   */
  private async importComments(comments: any, piaId: number): Promise<any> {
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
      this.commentsService.create(commentModel);
    });
  }

  /**
   * Get the status of the PIA.
   * @returns {string} - Locale for translation.
   */
  getStatusName(status): string {
    if (status >= 0) {
      return `pia.statuses.${status}`;
    }
  }

  /**
   * Get people status.
   * @param {boolean} status - The people search status.
   * @returns {string} - Locale for translation.
   */
  getPeopleSearchStatus(status: boolean): string {
    if (status === true) {
      return 'summary.people_search_status_ok';
    } else {
      return 'summary.people_search_status_nok';
    }
  }

  /**
   * Get opinion status.
   * @param {string} status - The opinion status.
   * @returns {string} - Locale for translation.
   */
  getOpinionsStatus(status: string): string {
    if (status) {
      return `summary.content_choice.${status}`;
    }
  }

  /**
   * Get gauge name.
   * @param {*} value - The gauge value.
   * @returns {string} - Locale for translation.
   */
  getGaugeName(value: any): string {
    if (value) {
      return `summary.gauges.${value}`;
    }
  }
}
