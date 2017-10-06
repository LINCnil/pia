import { Injectable } from '@angular/core';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

@Injectable()
export class GlobalEvaluationService {

  async isInEvaluation(pia: any, sid: string, item: any) {
    return new Promise((resolve, reject) => {
      if (item.evaluation_mode === 'item') {
        const evaluationModel = new Evaluation();
        evaluationModel.existByReference(pia.id, sid).then((exist: boolean) => {
          resolve(exist);
        });
      } else if (item.questions) {
        let count = 0;
        item.questions.forEach(question => {
          const answerModel = new Answer();
          answerModel.getByReferenceAndPia(pia.id, question.id).then(() => {
            if (answerModel.id) {
              const evaluationModel = new Evaluation();
              evaluationModel.existByReference(pia.id, sid + '.' + answerModel.reference_to).then((exist: boolean) => {
                if (exist) {
                  count += 1;
                }
                if (item.questions.length === count) {
                  resolve(true);
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
      } else if (item.questions) {
        let count = 0;
        item.questions.forEach(question => {
          const answerModel = new Answer();
          answerModel.getByReferenceAndPia(pia.id, question.id).then(() => {
            if (answerModel.id) {
              const evaluationModel = new Evaluation();
              evaluationModel.globalStatusByReference(pia.id, sid + '.' + answerModel.reference_to).then((exist: boolean) => {
                if (exist) {
                  count += 1;
                }
                if (item.questions.length === count) {
                  resolve(true);
                }
              });
            }
          });
        });
      }
    });
  }
}
