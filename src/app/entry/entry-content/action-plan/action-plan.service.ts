import { Injectable } from '@angular/core';
import { Evaluation } from '../evaluations/evaluation.model';
import { Measure } from '../measures/measure.model';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from '../../../services/languages.service'

// new import
import { EvaluationModel, AnswerModel, MeasureModel } from '@api/models';
import { EvaluationApi, AnswerApi, MeasureApi } from '@api/services';

@Injectable()
export class ActionPlanService {
  data: any;
  pia: any;
  evaluationModel: Evaluation = new Evaluation();
  risks = {
    '3.2': null,
    '3.3': null,
    '3.4': null
  };
  measures = [];
  results = [];
  principlesActionPlanReady = false;
  measuresActionPlanReady = false;
  risksActionPlan32Ready = false;
  risksActionPlan33Ready = false;
  risksActionPlan34Ready = false;
  csvRows = [];

  constructor(
    private _translateService: TranslateService,
    private _languagesService: LanguagesService,
    private evaluationApi: EvaluationApi,
    private measureApi: MeasureApi) { }

  /**
   * Get action plan.
   * @memberof ActionPlanService
   */
  listActionPlan() {
    this.results = [];
    this.measures = [];
    this.principlesActionPlanReady = false;
    this.measuresActionPlanReady = false;
    this.risksActionPlan32Ready = false;
    this.risksActionPlan33Ready = false;
    this.risksActionPlan34Ready = false;
    const section = this.data.sections.filter((s) => {
      return s.id === 3;
    });
    console.log(section);
    section[0].items.forEach((item) => {
      if (item.evaluation_mode === 'item') {
        item.questions.forEach(q => {

          const reference_to = '2.' + item.id + '.' + q.id;
          this.evaluationApi.getByRef(this.pia.id, reference_to).subscribe((evaluation: EvaluationModel) => {
            if (!evaluation) {
              return;
            }
            if (evaluation.status > 0) {
              if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
                this.principlesActionPlanReady = true;
              }
              this.results.push({
                status: evaluation.status,
                short_title: q.short_title,
                action_plan_comment: evaluation.action_plan_comment,
                evaluation_comment: evaluation.evaluation_comment,
                evaluation: evaluation
              });
            } else {
              this.results.push({
                status: null,
                short_title: q.short_title,
                action_plan_comment: null,
                evaluation_comment: null,
                evaluation: null
              });
            }
          });
        });
      }
    });

    this.measureApi.getAll(this.pia.id).subscribe((entries: MeasureModel[]) => {
      entries.forEach(m => {
        const reference_to = '3.1.' + m.id;
        this.measures[reference_to] = null;
        this.evaluationApi.getByRef(this.pia.id, reference_to).subscribe((evaluation2: EvaluationModel) => {
          if (evaluation2 && evaluation2.status > 0) {
            if (evaluation2.action_plan_comment && evaluation2.action_plan_comment.length > 0) {
              this.measuresActionPlanReady = true;
            }
            this.measures.push({
              name: m.title,
              short_title: m.title,
              status: evaluation2.status,
              action_plan_comment: evaluation2.action_plan_comment,
              evaluation_comment: evaluation2.evaluation_comment,
              evaluation: evaluation2
 });
          } else {
            this.measures.push({
              name: m.title,
              short_title: null,
              status: null,
              action_plan_comment: null,
              evaluation_comment: null,
              evaluation: null
            });
          }
        });
      });
    });

    this.evaluationApi.getByRef(this.pia.id, '3.2').subscribe((evaluation3: EvaluationModel) => {
      if (evaluation3 && evaluation3.status > 0) {
        if (evaluation3.action_plan_comment && evaluation3.action_plan_comment.length > 0) {
          this.risksActionPlan32Ready = true;
        }
        this.risks['3.2'] = {
          status: evaluation3.status,
          short_title: this._translateService.instant('action_plan.risk1'),
          action_plan_comment: evaluation3.action_plan_comment,
          evaluation_comment: evaluation3.evaluation_comment,
          evaluation: evaluation3
        };
      }
    });

    this.evaluationApi.getByRef(this.pia.id, '3.3').subscribe((evaluation4: EvaluationModel) => {

      if (evaluation4 && evaluation4.status > 0) {
        if (evaluation4.action_plan_comment && evaluation4.action_plan_comment.length > 0) {
          this.risksActionPlan33Ready = true;
        }
        this.risks['3.3'] = {
          status: evaluation4.status,
          short_title: this._translateService.instant('action_plan.risk2'),
          action_plan_comment: evaluation4.action_plan_comment,
          evaluation_comment: evaluation4.evaluation_comment,
          evaluation: evaluation4
        };
      }
    });


    this.evaluationApi.getByRef(this.pia.id, '3.4').subscribe((evaluation5: EvaluationModel) => {
      if (evaluation5 && evaluation5.status > 0) {
        if (evaluation5.action_plan_comment && evaluation5.action_plan_comment.length > 0) {
          this.risksActionPlan34Ready = true;
        }
        this.risks['3.4'] = {
          status: evaluation5.status,
          short_title: this._translateService.instant('action_plan.risk3'),
          action_plan_comment: evaluation5.action_plan_comment,
          evaluation_comment: evaluation5.evaluation_comment,
          evaluation: evaluation5
        };
      }
    });
  }

  /**
   * Generate CSV contents
   * @memberof ActionPlanService
   */
  getCsv() {
    this.csvRows = [];
    if (this.results && this.results.length > 0) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.principles') });
      this.results.forEach(data => {
        if (data && data.action_plan_comment && data.action_plan_comment.length > 0) {
          this.csvRows.push({
            blank: '',
            short_title: data.short_title ? this._translateService.instant(data.short_title) : '',
            action_plan_comment: this.filterText(data.action_plan_comment),
            evaluation_comment: this.filterText(data.evaluation_comment),
            evaluation_date: this.filterText(data.estimated_implementation_date),
            evaluation_charge: this.filterText(data.person_in_charge)
          });
        }
      });
    }

    if (this.measures && this.measures.length > 0) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.measures') });
      this.measures.forEach(data => {
        if (data && data.action_plan_comment && data.action_plan_comment.length > 0) {
          this.csvRows.push({
            blank: '',
            short_title: data.short_title ? this._translateService.instant(data.short_title) : '',
            action_plan_comment: this.filterText(data.action_plan_comment),
            evaluation_comment: this.filterText(data.evaluation_comment),
            evaluation_date: this.filterText(data.estimated_implementation_date),
            evaluation_charge: this.filterText(data.person_in_charge)
          });
        }
      });
    }

    if (this.risks['3.2']) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.risks') });
      this.csvRows.push({
        blank: '',
        short_title: this._translateService.instant('action_plan.risk1'),
        action_plan_comment: this.filterText(this.risks['3.2'].action_plan_comment),
        evaluation_comment: this.filterText(this.risks['3.2'].evaluation_comment),
        evaluation_date: this.filterText(this.risks['3.2'].estimated_implementation_date),
        evaluation_charge: this.filterText(this.risks['3.2'].person_in_charge)
      });
    }

    if (this.risks['3.3']) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.risk2') });
      this.csvRows.push({
        blank: '',
        short_title: this._translateService.instant('action_plan.risk2'),
        action_plan_comment: this.filterText(this.risks['3.3'].action_plan_comment),
        evaluation_comment: this.filterText(this.risks['3.3'].evaluation_comment),
        evaluation_date: this.filterText(this.risks['3.3'].estimated_implementation_date),
        evaluation_charge: this.filterText(this.risks['3.3'].person_in_charge)
      });
    }

    if (this.risks['3.4']) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.risk3') });
      this.csvRows.push({
        blank: '',
        short_title: this._translateService.instant('action_plan.risk3'),
        action_plan_comment: this.filterText(this.risks['3.4'].action_plan_comment),
        evaluation_comment: this.filterText(this.risks['3.4'].evaluation_comment),
        evaluation_date: this.filterText(this.risks['3.4'].estimated_implementation_date),
        evaluation_charge: this.filterText(this.risks['3.4'].person_in_charge)
      });
    }
  }

  private filterText(data: string, isDate = false) {
    if (data && data.length > 0) {
      if (isDate) {
        const date = Date.parse(data);
        if (date !== NaN) {
          const locale = this._languagesService.selectedLanguage;
          const newDate = new Date(date);
          data = new Intl.DateTimeFormat(locale).format(newDate);
        }
      } else {
        const divElement = document.createElement('div');
        divElement.innerHTML = data;
        data = divElement.innerText;
      }
    } else {
      data = '';
    }
    return data;
  }
}
