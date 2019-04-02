import { Injectable } from '@angular/core';

import { Evaluation } from 'src/app/entry/entry-content/evaluations/evaluation.model';
import { Measure } from 'src/app/entry/entry-content/measures/measure.model';

import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';

import { FormatTheDate } from '../../../tools';

@Injectable()
export class ActionPlanService {
  data: any;
  pia: any;
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

  constructor(private _translateService: TranslateService, private _languagesService: LanguagesService,
              private formatTheDate: FormatTheDate) { }

  /**
   * Get action plan.
   */
  listActionPlan() {
    this.csvRows = [];
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

    let firstRow = true;
    section[0].items.forEach((item) => {
      item.questions.forEach(q => {
        const evaluation = new Evaluation();
        const referenceTo = '2.' + item.id + '.' + q.id;
        evaluation.getByReference(this.pia.id, referenceTo).then(() => {
          if (evaluation.status > 0) {
            if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
              this.principlesActionPlanReady = true;
            }
            this.results.push({ status: evaluation.status,
                                short_title: q.short_title,
                                action_plan_comment: evaluation.action_plan_comment,
                                evaluation_comment: evaluation.evaluation_comment,
                                evaluation });
            if (firstRow) {
              firstRow = false;
              this.csvRows.push({title: this._translateService.instant('action_plan.principles')});
            }
            this.csvRows.push({ blank: ' ',
                                short_title: q.short_title ? this._translateService.instant(q.short_title) : '',
                                action_plan_comment: this.filterText(evaluation.action_plan_comment),
                                evaluation_comment: this.filterText(evaluation.evaluation_comment),
                                evaluation_date: this.filterText(this.formatTheDate.transform(evaluation.estimated_implementation_date, this._languagesService.selectedLanguage).toString()),
                                evaluation_charge: this.filterText(evaluation.person_in_charge) });
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

    firstRow = true;
    const measure = new Measure();
    measure.pia_id = this.pia.id;
    measure.findAll().then((entries: any) => {
      entries.forEach(m => {
        const evaluation2 = new Evaluation();
        const referenceTo = '3.1.' + m.id;
        this.measures[referenceTo] = null;
        evaluation2.getByReference(this.pia.id, referenceTo).then(() => {
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
            if (firstRow) {
              firstRow = false;
              this.csvRows.push({ title: this._translateService.instant('action_plan.measures') });
            }
            this.csvRows.push({ blank: ' ',
                                short_title: m.title ? this._translateService.instant(m.title) : '',
                                action_plan_comment: this.filterText(evaluation2.action_plan_comment),
                                evaluation_comment: this.filterText(evaluation2.evaluation_comment),
                                evaluation_date: this.filterText(this.formatTheDate.transform(evaluation2.estimated_implementation_date, this._languagesService.selectedLanguage).toString()),
                                evaluation_charge: this.filterText(evaluation2.person_in_charge) });
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

    firstRow = true;
    let shortTitle = '';
    const evaluation3 = new Evaluation();
    evaluation3.getByReference(this.pia.id, '3.2').then(() => {
      if (evaluation3.status > 0) {
        if (evaluation3.action_plan_comment && evaluation3.action_plan_comment.length > 0) {
          this.risksActionPlan32Ready = true;
        }
        shortTitle = this._translateService.instant('action_plan.risk1');
        this.risks['3.2'] = { status: evaluation3.status,
                              short_title: shortTitle,
                              action_plan_comment: evaluation3.action_plan_comment,
                              evaluation_comment: evaluation3.evaluation_comment,
                              evaluation: evaluation3 };
        if (firstRow) {
          firstRow = false;
          this.csvRows.push({ title: this._translateService.instant('action_plan.risks') });
        }
        this.csvRows.push({ blank: ' ',
                            short_title: shortTitle,
                            action_plan_comment: this.filterText(evaluation3.action_plan_comment),
                            evaluation_comment: this.filterText(evaluation3.evaluation_comment),
                            evaluation_date: this.filterText(this.formatTheDate.transform(evaluation3.estimated_implementation_date, this._languagesService.selectedLanguage).toString()),
                            evaluation_charge: this.filterText(evaluation3.person_in_charge) });
      }
    });

    firstRow = true;
    const evaluation4 = new Evaluation();
    evaluation4.getByReference(this.pia.id, '3.3').then(() => {
      if (evaluation4.status > 0) {
        if (evaluation4.action_plan_comment && evaluation4.action_plan_comment.length > 0) {
          this.risksActionPlan33Ready = true;
        }
        shortTitle = this._translateService.instant('action_plan.risk2');
        this.risks['3.3'] = { status: evaluation4.status,
                              short_title: shortTitle,
                              action_plan_comment: evaluation4.action_plan_comment,
                              evaluation_comment: evaluation4.evaluation_comment,
                              evaluation: evaluation4 };
        if (firstRow) {
          firstRow = false;
          this.csvRows.push({ title: this._translateService.instant('action_plan.risk2') });
        }
        this.csvRows.push({ blank: ' ',
                            short_title: shortTitle,
                            action_plan_comment: this.filterText(evaluation4.action_plan_comment),
                            evaluation_comment: this.filterText(evaluation4.evaluation_comment),
                            evaluation_date: this.filterText(this.formatTheDate.transform(evaluation4.estimated_implementation_date, this._languagesService.selectedLanguage).toString()),
                            evaluation_charge: this.filterText(evaluation4.person_in_charge) });
      }
    });

    firstRow = true;
    const evaluation5 = new Evaluation();
    evaluation5.getByReference(this.pia.id, '3.4').then(() => {
      if (evaluation5.status > 0) {
        if (evaluation5.action_plan_comment && evaluation5.action_plan_comment.length > 0) {
          this.risksActionPlan34Ready = true;
        }
        shortTitle = this._translateService.instant('action_plan.risk3');
        this.risks['3.4'] = { status: evaluation5.status,
                              short_title: shortTitle,
                              action_plan_comment: evaluation5.action_plan_comment,
                              evaluation_comment: evaluation5.evaluation_comment,
                              evaluation: evaluation5 };
        if (firstRow) {
          firstRow = false;
          this.csvRows.push({ title: this._translateService.instant('action_plan.risk3') });
        }
        this.csvRows.push({ blank: ' ',
                            short_title: shortTitle,
                            action_plan_comment: this.filterText(evaluation5.action_plan_comment),
                            evaluation_comment: this.filterText(evaluation5.evaluation_comment),
                            evaluation_date: this.filterText(this.formatTheDate.transform(evaluation5.estimated_implementation_date, this._languagesService.selectedLanguage).toString()),
                            evaluation_charge: this.filterText(evaluation5.person_in_charge) });
      }
    });
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
        if (!isNaN(date)) {
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
