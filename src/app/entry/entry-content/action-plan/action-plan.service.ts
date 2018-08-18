import { Injectable } from '@angular/core';

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';

import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages.service'

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

  constructor(private _translateService: TranslateService, private _languagesService: LanguagesService) { }

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
      return s.id === 2;
    });
    section[0].items.forEach((item) => {
      item.questions.forEach(q => {
        const evaluation = new Evaluation();
        const reference_to = '2.' + item.id + '.' + q.id;
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.status > 0) {
            if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
              this.principlesActionPlanReady = true;
            }
            this.results.push({ status: evaluation.status,
                                short_title: q.short_title,
                                action_plan_comment: evaluation.action_plan_comment,
                                evaluation_comment: evaluation.evaluation_comment,
                                evaluation: evaluation });
          } else {
            this.results.push({ status: null,
                                short_title: q.short_title,
                                action_plan_comment: null,
                                evaluation_comment: null,
                                evaluation: null });
          }
        });
      });
    });

    const measure = new Measure();
    measure.pia_id = this.pia.id;
    measure.findAll().then((entries: any) => {
      entries.forEach(m => {
        const evaluation2 = new Evaluation();
        const reference_to = '3.1.' + m.id;
        this.measures[reference_to] = null;
        evaluation2.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation2.status > 0) {
            if (evaluation2.action_plan_comment && evaluation2.action_plan_comment.length > 0) {
              this.measuresActionPlanReady = true;
            }
            this.measures.push({ name: m.title,
                                short_title: m.title,
                                status: evaluation2.status,
                                action_plan_comment: evaluation2.action_plan_comment,
                                evaluation_comment: evaluation2.evaluation_comment,
                                evaluation: evaluation2 });
          } else {
            this.measures.push({ name: m.title,
                                short_title: null,
                                status: null,
                                action_plan_comment: null,
                                evaluation_comment: null,
                                evaluation: null });
          }
        });
      });
    });

    const evaluation3 = new Evaluation();
    evaluation3.getByReference(this.pia.id, '3.2').then(() => {
      if (evaluation3.status > 0) {
        if (evaluation3.action_plan_comment && evaluation3.action_plan_comment.length > 0) {
          this.risksActionPlan32Ready = true;
        }
        this.risks['3.2'] = { status: evaluation3.status,
                              short_title: this._translateService.instant('action_plan.risk1'),
                              action_plan_comment: evaluation3.action_plan_comment,
                              evaluation_comment: evaluation3.evaluation_comment,
                              evaluation: evaluation3 };
      }
    });

    const evaluation4 = new Evaluation();
    evaluation4.getByReference(this.pia.id, '3.3').then(() => {
      if (evaluation4.status > 0) {
        if (evaluation4.action_plan_comment && evaluation4.action_plan_comment.length > 0) {
          this.risksActionPlan33Ready = true;
        }
        this.risks['3.3'] = { status: evaluation4.status,
                              short_title: this._translateService.instant('action_plan.risk2'),
                              action_plan_comment: evaluation4.action_plan_comment,
                              evaluation_comment: evaluation4.evaluation_comment,
                              evaluation: evaluation4 };
      }
    });

    const evaluation5 = new Evaluation();
    evaluation5.getByReference(this.pia.id, '3.4').then(() => {
      if (evaluation5.status > 0) {
        if (evaluation5.action_plan_comment && evaluation5.action_plan_comment.length > 0) {
          this.risksActionPlan34Ready = true;
        }
        this.risks['3.4'] = { status: evaluation5.status,
                              short_title: this._translateService.instant('action_plan.risk3'),
                              action_plan_comment: evaluation5.action_plan_comment,
                              evaluation_comment: evaluation5.evaluation_comment,
                              evaluation: evaluation5 };
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
          this.csvRows.push({ blank: '',
                              short_title: data.short_title ? this._translateService.instant(data.short_title) : '',
                              action_plan_comment: this.filterText(data.action_plan_comment),
                              evaluation_comment: this.filterText(data.evaluation_comment),
                              evaluation_date: this.filterText(data.estimated_implementation_date),
                              evaluation_charge: this.filterText(data.person_in_charge) });
        }
      });
    }

    if (this.measures && this.measures.length > 0) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.measures') });
      this.measures.forEach(data => {
        if (data && data.action_plan_comment && data.action_plan_comment.length > 0) {
          this.csvRows.push({ blank: '',
                              short_title: data.short_title ? this._translateService.instant(data.short_title) : '',
                              action_plan_comment: this.filterText(data.action_plan_comment),
                              evaluation_comment: this.filterText(data.evaluation_comment),
                              evaluation_date: this.filterText(data.estimated_implementation_date),
                              evaluation_charge: this.filterText(data.person_in_charge) });
        }
      });
    }

    if (this.risks['3.2']) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.risks') });
      this.csvRows.push({ blank: '',
                          short_title: this._translateService.instant('action_plan.risk1'),
                          action_plan_comment: this.filterText(this.risks['3.2'].action_plan_comment),
                          evaluation_comment: this.filterText(this.risks['3.2'].evaluation_comment),
                          evaluation_date: this.filterText(this.risks['3.2'].estimated_implementation_date),
                          evaluation_charge: this.filterText(this.risks['3.2'].person_in_charge) });
    }

    if (this.risks['3.3']) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.risk2') });
      this.csvRows.push({ blank: '',
                          short_title: this._translateService.instant('action_plan.risk2'),
                          action_plan_comment: this.filterText(this.risks['3.3'].action_plan_comment),
                          evaluation_comment: this.filterText(this.risks['3.3'].evaluation_comment),
                          evaluation_date: this.filterText(this.risks['3.3'].estimated_implementation_date),
                          evaluation_charge: this.filterText(this.risks['3.3'].person_in_charge) });
    }

    if (this.risks['3.4']) {
      this.csvRows.push({ title: this._translateService.instant('action_plan.risk3') });
      this.csvRows.push({ blank: '',
                          short_title: this._translateService.instant('action_plan.risk3'),
                          action_plan_comment: this.filterText(this.risks['3.4'].action_plan_comment),
                          evaluation_comment: this.filterText(this.risks['3.4'].evaluation_comment),
                          evaluation_date: this.filterText(this.risks['3.4'].estimated_implementation_date),
                          evaluation_charge: this.filterText(this.risks['3.4'].person_in_charge) });
    }
  }

  /**
   * Filter the passed text
   * @param data a string to filter
   * @param isDate true if it's a date, false otherwise
   */
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
