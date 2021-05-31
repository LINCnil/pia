import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';

import { FormatTheDate } from '../tools';
import { EvaluationService } from './evaluation.service';
import { MeasureService } from './measures.service';

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

  constructor(
    private translateService: TranslateService,
    private languagesService: LanguagesService,
    private formatTheDate: FormatTheDate,
    private measureService: MeasureService,
    private evaluationService: EvaluationService
  ) {}

  /**
   * Get action plan.
   */
  async listActionPlan() {
    this.csvRows = [];
    this.results = [];
    this.measures = [];
    this.principlesActionPlanReady = false;
    this.measuresActionPlanReady = false;
    this.risksActionPlan32Ready = false;
    this.risksActionPlan33Ready = false;
    this.risksActionPlan34Ready = false;
    const section = this.data.sections.filter(s => {
      return s.id === 2;
    });

    let title1 = true;
    for (const item of section[0].items) {
      for (const q of item.questions) {
        // const evaluation = new Evaluation();
        const referenceTo = '2.' + item.id + '.' + q.id;
        await this.evaluationService
          .getByReference(this.pia.id, referenceTo)
          .then(evaluation => {
            if (evaluation && evaluation.status > 0) {
              if (
                evaluation.action_plan_comment &&
                evaluation.action_plan_comment.length > 0
              ) {
                this.principlesActionPlanReady = true;
              }

              // item
              const temp = {
                status: evaluation.status,
                short_title: q.short_title,
                action_plan_comment: evaluation.action_plan_comment,
                evaluation_comment: evaluation.evaluation_comment,
                evaluation
              };

              if (
                this.results.findIndex(
                  e =>
                    e.status === temp.status &&
                    e.short_title === temp.short_title
                ) === -1
              ) {
                // check if not exist
                this.results.push(temp);
              }

              if (title1) {
                title1 = false;
                this.csvRows.push({
                  title: this.translateService.instant('action_plan.principles')
                });
              }

              this.csvRows.push({
                blank: ' ',
                short_title: q.short_title
                  ? this.translateService.instant(q.short_title)
                  : '',
                action_plan_comment: this.filterText(
                  evaluation.action_plan_comment
                ),
                evaluation_comment: this.filterText(
                  evaluation.evaluation_comment
                ),
                evaluation_date: this.filterText(
                  this.formatTheDate
                    .transform(
                      evaluation.estimated_implementation_date,
                      this.languagesService.selectedLanguage
                    )
                    .toString()
                ),
                evaluation_charge: this.filterText(evaluation.person_in_charge)
              });
            } else {
              if (
                this.results.findIndex(e => e.short_title === q.short_title) ===
                -1
              ) {
                // check if not exist
                this.results.push({
                  status: null,
                  short_title: q.short_title,
                  action_plan_comment: null,
                  evaluation_comment: null,
                  evaluation: null
                });
              }
            }
          });
      }
    }

    let title2 = true;
    await this.measureService.findAllByPia(this.pia.id).then((entries: any) => {
      for (const m of entries) {
        const referenceTo = '3.1.' + m.id;
        this.evaluationService
          .getByReference(this.pia.id, referenceTo)
          .then(evaluation => {
            if (evaluation && evaluation.status > 0) {
              if (
                evaluation.action_plan_comment &&
                evaluation.action_plan_comment.length > 0
              ) {
                this.measuresActionPlanReady = true;
              }
              if (this.measures.findIndex(e => e.name === m.title) === -1) {
                this.measures.push({
                  name: m.title,
                  short_title: m.title,
                  status: evaluation.status,
                  action_plan_comment: evaluation.action_plan_comment,
                  evaluation_comment: evaluation.evaluation_comment,
                  evaluation
                });
              }

              if (title2) {
                title2 = false;
                this.csvRows.push({
                  title: this.translateService.instant('action_plan.measures')
                });
              }

              this.csvRows.push({
                blank: ' ',
                short_title: m.title
                  ? this.translateService.instant(m.title)
                  : '',
                action_plan_comment: this.filterText(
                  evaluation.action_plan_comment
                ),
                evaluation_comment: this.filterText(
                  evaluation.evaluation_comment
                ),
                evaluation_date: this.filterText(
                  this.formatTheDate
                    .transform(
                      evaluation.estimated_implementation_date,
                      this.languagesService.selectedLanguage
                    )
                    .toString()
                ),
                evaluation_charge: this.filterText(evaluation.person_in_charge)
              });
            } else {
              if (this.measures.findIndex(e => e.name === m.title) === -1) {
                this.measures.push({
                  name: m.title,
                  short_title: null,
                  status: null,
                  action_plan_comment: null,
                  evaluation_comment: null,
                  evaluation: null
                });
              }
            }
          });
      }
    });

    let title3 = true;
    let shortTitle = '';
    // const evaluation3 = new Evaluation();
    await this.evaluationService
      .getByReference(this.pia.id, '3.2')
      .then(evaluation => {
        if (evaluation && evaluation.status > 0) {
          if (
            evaluation.action_plan_comment &&
            evaluation.action_plan_comment.length > 0
          ) {
            this.risksActionPlan32Ready = true;
          }
          shortTitle = this.translateService.instant('action_plan.risk1');
          this.risks['3.2'] = {
            status: evaluation.status,
            short_title: shortTitle,
            action_plan_comment: evaluation.action_plan_comment,
            evaluation_comment: evaluation.evaluation_comment,
            evaluation
          };
          if (title3) {
            title3 = false;
            this.csvRows.push({
              title: this.translateService.instant('action_plan.risk1')
            });
          }
          this.csvRows.push({
            blank: ' ',
            short_title: shortTitle,
            action_plan_comment: this.filterText(
              evaluation.action_plan_comment
            ),
            evaluation_comment: this.filterText(evaluation.evaluation_comment),
            evaluation_date: this.filterText(
              this.formatTheDate
                .transform(
                  evaluation.estimated_implementation_date,
                  this.languagesService.selectedLanguage
                )
                .toString()
            ),
            evaluation_charge: this.filterText(evaluation.person_in_charge)
          });
        }
      });

    let title4 = true;
    // const evaluation4 = new Evaluation();
    await this.evaluationService
      .getByReference(this.pia.id, '3.3')
      .then(evaluation => {
        if (evaluation && evaluation.status > 0) {
          if (
            evaluation.action_plan_comment &&
            evaluation.action_plan_comment.length > 0
          ) {
            this.risksActionPlan33Ready = true;
          }
          shortTitle = this.translateService.instant('action_plan.risk2');
          this.risks['3.3'] = {
            status: evaluation.status,
            short_title: shortTitle,
            action_plan_comment: evaluation.action_plan_comment,
            evaluation_comment: evaluation.evaluation_comment,
            evaluation
          };
          if (title4) {
            title4 = false;
            this.csvRows.push({
              title: this.translateService.instant('action_plan.risk2')
            });
          }
          this.csvRows.push({
            blank: ' ',
            short_title: shortTitle,
            action_plan_comment: this.filterText(
              evaluation.action_plan_comment
            ),
            evaluation_comment: this.filterText(evaluation.evaluation_comment),
            evaluation_date: this.filterText(
              this.formatTheDate
                .transform(
                  evaluation.estimated_implementation_date,
                  this.languagesService.selectedLanguage
                )
                .toString()
            ),
            evaluation_charge: this.filterText(evaluation.person_in_charge)
          });
        }
      });

    let title5 = true;
    // const evaluation5 = new Evaluation();
    await this.evaluationService
      .getByReference(this.pia.id, '3.4')
      .then(evaluation => {
        if (evaluation && evaluation.status > 0) {
          if (
            evaluation.action_plan_comment &&
            evaluation.action_plan_comment.length > 0
          ) {
            this.risksActionPlan34Ready = true;
          }
          shortTitle = this.translateService.instant('action_plan.risk3');
          this.risks['3.4'] = {
            status: evaluation.status,
            short_title: shortTitle,
            action_plan_comment: evaluation.action_plan_comment,
            evaluation_comment: evaluation.evaluation_comment,
            evaluation
          };
          if (title5) {
            title5 = false;
            this.csvRows.push({
              title: this.translateService.instant('action_plan.risk3')
            });
          }
          this.csvRows.push({
            blank: ' ',
            short_title: shortTitle,
            action_plan_comment: this.filterText(
              evaluation.action_plan_comment
            ),
            evaluation_comment: this.filterText(evaluation.evaluation_comment),
            evaluation_date: this.filterText(
              this.formatTheDate
                .transform(
                  evaluation.estimated_implementation_date,
                  this.languagesService.selectedLanguage
                )
                .toString()
            ),
            evaluation_charge: this.filterText(evaluation.person_in_charge)
          });
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
          const locale = this.languagesService.selectedLanguage;
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
