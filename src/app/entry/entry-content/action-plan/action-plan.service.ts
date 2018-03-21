import { Injectable } from '@angular/core';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { TranslateService } from '@ngx-translate/core';
import {SafeHtml} from '@angular/platform-browser';


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

  /**
   * Get action plan.
   * @param {TranslateService} translateService - The translate service.
   * @memberof ActionPlanService
   */
  listActionPlan(translateService: TranslateService) {
    this.results = [];
    this.measures = [];
    this.csvRows = [];
    const section = this.data.sections.filter((s) => {
      return s.id === 2;
    });
    // TODO Translate
    this.csvRows.push({ title: translateService.instant('summary.csv_fundamental') });
    section[0].items.forEach((item, idx, array) => {
      item.questions.forEach((q, idx2, array2) => {
        const evaluation = new Evaluation();
        const reference_to = '2.' + item.id + '.' + q.id;
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.status > 0) {
            if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
              this.principlesActionPlanReady = true;
            }
            this.results.push({ status: evaluation.status, short_title: q.short_title,
                                                          action_plan_comment: evaluation.action_plan_comment, evaluation: evaluation });
            let formatedDate = this.validateActionPlanDate(evaluation.estimated_implementation_date);
            let personCharge = this.checkPersonIncharge(evaluation.person_in_charge);
            let filterCommentsHtml = this.filterHtmlOnCsv(evaluation.action_plan_comment);
            this.csvRows.push({ blank: '', short_title: translateService.instant(q.short_title), action_plan_comment: filterCommentsHtml,
                                                          evaluation_date: formatedDate,
                                                          evaluation_charge: personCharge })
          } else {
            this.results.push({ status: null, short_title: q.short_title,
                                                          action_plan_comment: null, evaluation: null });
          }
          // End of principles treatment (for CSV generation)
          if (idx === array.length - 1 && idx2 === array2.length - 1 ) {
            // TODO Translate
            this.csvRows.push({ title: translateService.instant('summary.csv_measures') });
            this.getMeasures(translateService);
          }
        });
      });
    });

  }

  getMeasures(translateService: TranslateService) {
    const measure = new Measure();
    measure.pia_id = this.pia.id;
    measure.findAll().then((entries: any) => {
      entries.forEach((m, idx, array) => {
        const evaluation2 = new Evaluation();
        const reference_to = '3.1.' + m.id;
        this.measures[reference_to] = null;
        evaluation2.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation2.status > 0) {
            if (evaluation2.action_plan_comment && evaluation2.action_plan_comment.length > 0) {
              this.measuresActionPlanReady = true;
            }
            this.measures.push({ name: m.title, short_title: m.title, status: evaluation2.status,
              action_plan_comment: evaluation2.action_plan_comment, evaluation: evaluation2 });
            let formatedDate = this.validateActionPlanDate(evaluation2.estimated_implementation_date);
            let personCharge = this.checkPersonIncharge(evaluation2.person_in_charge);
            let filterCommentsHtml = this.filterHtmlOnCsv(evaluation2.action_plan_comment);
            this.csvRows.push({ blank: '', short_title: translateService.instant(m.title), action_plan_comment: filterCommentsHtml,
              evaluation_date: formatedDate,
              evaluation_charge: personCharge })
          } else {
            this.measures.push({ name: m.title, short_title: null, status: null, action_plan_comment: null, evaluation: null });
          }
          // End of measures treatment (for CSV generation)
          if (idx === array.length - 1) {
            this.getRisks(translateService);
          }
        });
      });
    });
  }

  getRisks(translateService: TranslateService) {
    const evaluation3 = new Evaluation();
    evaluation3.getByReference(this.pia.id, '3.2').then(() => {
      this.csvRows.push({ title: translateService.instant('action_plan.risk1') });
      if (evaluation3.status > 0) {
        if (evaluation3.action_plan_comment && evaluation3.action_plan_comment.length > 0) {
          this.risksActionPlan32Ready = true;
        }
        this.risks['3.2'] = { status: evaluation3.status, short_title: translateService.instant('action_plan.risk1'),
          action_plan_comment: evaluation3.action_plan_comment, evaluation: evaluation3 };
        let formatedDate = this.validateActionPlanDate(evaluation3.estimated_implementation_date);
        let personCharge = this.checkPersonIncharge(evaluation3.person_in_charge);
        let filterCommentsHtml = this.filterHtmlOnCsv(evaluation5.action_plan_comment);
        this.csvRows.push({ blank: '', short_title: translateService.instant('action_plan.risk1'),
          action_plan_comment: filterCommentsHtml,
          evaluation_date: formatedDate,
          evaluation_charge: personCharge })
      }
    });

    const evaluation4 = new Evaluation();
    evaluation4.getByReference(this.pia.id, '3.3').then(() => {
      this.csvRows.push({ title: translateService.instant('action_plan.risk2') });
      if (evaluation4.status > 0) {
        if (evaluation4.action_plan_comment && evaluation4.action_plan_comment.length > 0) {
          this.risksActionPlan33Ready = true;
        }
        this.risks['3.3'] = { status: evaluation4.status, short_title: translateService.instant('action_plan.risk2'),
          action_plan_comment: evaluation4.action_plan_comment, evaluation: evaluation4 };
        let formatedDate = this.validateActionPlanDate(evaluation5.estimated_implementation_date);
        let personCharge = this.checkPersonIncharge(evaluation5.person_in_charge);
        let filterCommentsHtml = this.filterHtmlOnCsv(evaluation5.action_plan_comment);
        this.csvRows.push({ blank: '', short_title: translateService.instant('action_plan.risk2'),
          action_plan_comment: filterCommentsHtml,
          evaluation_date: formatedDate,
          evaluation_charge: personCharge })
      }
    });

    const evaluation5 = new Evaluation();
    evaluation5.getByReference(this.pia.id, '3.4').then(() => {
      this.csvRows.push({ title: translateService.instant('action_plan.risk3') });
      if (evaluation5.status > 0) {
        if (evaluation5.action_plan_comment && evaluation5.action_plan_comment.length > 0) {
          this.risksActionPlan34Ready = true;
        }
        this.risks['3.4'] = { status: evaluation5.status, short_title: translateService.instant('action_plan.risk3'),
          action_plan_comment: evaluation5.action_plan_comment, evaluation: evaluation5 };
        let formatedDate = this.validateActionPlanDate(evaluation5.estimated_implementation_date);
        let personCharge = this.checkPersonIncharge(evaluation5.person_in_charge);
        let filterCommentsHtml = this.filterHtmlOnCsv(evaluation5.action_plan_comment);
        this.csvRows.push({ blank: '', short_title: translateService.instant('action_plan.risk3'),
          action_plan_comment: filterCommentsHtml,
          evaluation_date: formatedDate,
          evaluation_charge: personCharge })
      }
    });
  }
  /**
   * Check Information about person_in_charge.
   * @private
   * @returns {Person}
   */
  private checkPersonIncharge(person) {
    if (person && person.length > 0) {
      return person;
    } else {
      return '';
    }
  }
  // TODO if fix globally as undefined return blank remove this method and all calls on general method
  /**
   * Get a csv document.
   * @private
   * @returns {Date}
   */
  private validateActionPlanDate(value) {
    let matchedDate = value.toString().match('[0-9]{4}');
    if (matchedDate) {
      const newDate = new Date(value);
      const formatedDate =
        newDate.getDate()
        + '-' +
        newDate.getMonth()
        + '-' +
        newDate.getFullYear();
      return formatedDate;
    } else {
      return '';
    }
  }
  /**
   * Filter html return.
   * @private
   * @returns {Csv}
   */
  private filterHtmlOnCsv(value) {
    if (value && value.length > 0) {
      const filteredValue = value.replace(/<[br />]+>/g, "");
      return filteredValue.replace(/<[^>]+>/g, '');
    } else {
      return '';
    }
  }
}
