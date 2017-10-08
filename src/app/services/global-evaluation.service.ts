import { Injectable } from '@angular/core';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

@Injectable()
export class GlobalEvaluationService {

  enableValidation = false;

  async isInEvaluation(pia: any, sid: string, item: any) {
    return new Promise((resolve, reject) => {
      if (item.evaluation_mode === 'item') {
        const evaluationModel = new Evaluation();
        evaluationModel.getByReference(pia.id, sid).then(() => {
          resolve(evaluationModel && evaluationModel.id && evaluationModel.status !== 1);
        });
      } else if (item.is_measure) {
        let count = 0;
        let countValid = 0;
        const measureModel = new Measure();
        measureModel.pia_id = pia.id;
        measureModel.findAll().then((measures: any) => {
          measures.forEach(measure => {
            const evaluationModel = new Evaluation();
            evaluationModel.getByReference(pia.id, sid + '.' + measure.id).then(() => {
              count += 1;
              if (evaluationModel && evaluationModel.id && evaluationModel.status !== 1) {
                countValid += 1;
              }
              if (measures.length === count) {
                resolve(count === countValid);
              }
            });
          });
        });
      } else if (item.evaluation_mode === 'question') {
        let count = 0;
        let countValid = 0;
        item.questions.forEach(question => {
          const answerModel = new Answer();
          answerModel.getByReferenceAndPia(pia.id, question.id).then(() => {
            if (answerModel.id) {
              const evaluationModel = new Evaluation();
              evaluationModel.getByReference(pia.id, sid + '.' + answerModel.reference_to).then(() => {
                count += 1;
                if (evaluationModel && evaluationModel.id && evaluationModel.status !== 1) {
                  countValid += 1;
                }
                if (item.questions.length === count) {
                  resolve(count === countValid);
                }
              });
            }
          });
        });
      }
    });
  }

  async isValidated(pia: any, sid: string, item: any) {
    return new Promise((resolve, reject) => {
      if (item.evaluation_mode === 'item') {
        const evaluationModel = new Evaluation();
        evaluationModel.globalStatusByReference(pia.id, sid).then((exist: boolean) => {
          resolve(exist);
        });
      } else if (item.is_measure) {
        let count = 0;
        let countValid = 0;
        const measureModel = new Measure();
        measureModel.pia_id = pia.id;
        measureModel.findAll().then((measures: any) => {
          measures.forEach(measure => {
            const evaluationModel = new Evaluation();
            evaluationModel.globalStatusByReference(pia.id, sid + '.' + measure.id).then((exist: boolean) => {
              count += 1;
              if (exist) {
                countValid += 1;
              }
              if (measures.length === count) {
                resolve(count === countValid);
              }
            });
          });
        });
      } else if (item.evaluation_mode === 'question') {
        let count = 0;
        let countValid = 0;
        item.questions.forEach(question => {
          const answerModel = new Answer();
          answerModel.getByReferenceAndPia(pia.id, question.id).then(() => {
            if (answerModel.id) {
              const evaluationModel = new Evaluation();
              evaluationModel.globalStatusByReference(pia.id, sid + '.' + answerModel.reference_to).then((exist: boolean) => {
                count += 1;
                if (exist) {
                  countValid += 1;
                }
                if (item.questions.length === count) {
                  resolve(count === countValid);
                }
              });
            }
          });
        });
      }
    });
  }

  async checkForFinalValidation(pia: any, section: any, item: any) {
    const sid = section.id + '.' + item.id;
    this.enableValidation = false;
    return new Promise((resolve, reject) => {
      if (item.evaluation_mode === 'item') {
        const evaluationModel = new Evaluation();
        evaluationModel.getByReference(pia.id, sid).then(() => {
          this.enableValidation = this.checkEvaluationStatus(item, evaluationModel);
          resolve();
        });
      } else if (item.is_measure) {
        let count = 0;
        let countValid = 0;
        const measureModel = new Measure();
        measureModel.pia_id = pia.id;
        measureModel.findAll().then((measures: any) => {
          measures.forEach(measure => {
            const evaluationModel = new Evaluation();
            evaluationModel.getByReference(pia.id, sid + '.' + measure.id).then(() => {
              count += 1;
              if (evaluationModel && evaluationModel.id) {
                const status = this.checkEvaluationStatus(item, evaluationModel);
                if (status) {
                  countValid += 1;
                }
              }
              if (measures.length === count) {
                this.enableValidation = (count === countValid);
                resolve();
              }
            });
          });
        });
      } else if (item.evaluation_mode === 'question') {
        let count = 0;
        let countValid = 0;
        item.questions.forEach(question => {
          const answerModel = new Answer();
          answerModel.getByReferenceAndPia(pia.id, question.id).then(() => {
            if (answerModel.id) {
              const evaluationModel = new Evaluation();
              evaluationModel.getByReference(pia.id, sid + '.' + answerModel.reference_to).then(() => {
                count += 1;
                if (evaluationModel && evaluationModel.id) {
                  const status = this.checkEvaluationStatus(item, evaluationModel);
                  if (status) {
                    countValid += 1;
                  }
                }
                if (item.questions.length === count) {
                  this.enableValidation = (count === countValid);
                  resolve();
                }
              });
            }
          });
        });
      }
    });
  }

  private checkEvaluationStatus(item: any, evaluation: any) {
    let status = false;
    if (evaluation.status === 1) {
      if (evaluation.evaluation_comment && evaluation.evaluation_comment.length > 0) {
        status = true;
      }
    } else if (evaluation.status === 2) {
      if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
        status = true;
      }
      if (item.evaluation_mode === 'item' && item.evaluation_with_gauge === true) {
        if (evaluation.gauges && evaluation.gauges['x'] > 0 && evaluation.gauges['y'] > 0) {
          status = true;
        }
      }
    } else if (evaluation.status === 3) {
      status = true;
    }
    return status;
  }

}
