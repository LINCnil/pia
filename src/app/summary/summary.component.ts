import { Component, ElementRef, OnInit } from '@angular/core';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppDataService } from 'app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalsService } from '../modals/modals.service';
import { Angular2Csv } from 'angular2-csv';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [PiaService]
})
export class SummaryComponent implements OnInit {

  content: any[];
  pia: any;
  allData: Object;
  dataNav: any;
  showPiaTpl: boolean;
  displayFilters: boolean;
  displayMainPiaData: boolean;
  displayActionPlan: boolean;

  constructor(private el: ElementRef,
              private route: ActivatedRoute,
              private _attachmentsService: AttachmentsService,
              public _actionPlanService: ActionPlanService,
              private _translateService: TranslateService,
              private _appDataService: AppDataService,
              public _piaService: PiaService,
              private _modalService: ModalsService) { }

  async ngOnInit() {
    this.content = [];
    this.dataNav = await this._appDataService.getDataNav();
    this.displayMainPiaData = true;
    this.displayActionPlan = true;
    this._piaService.getPIA().then(() => {
      this.pia = this._piaService.pia;
      this.showPiaTpl = true;
      this.showPia().then(() => {
        if (this.route.snapshot.params['type'] === 'action_plan') {
          this.showPiaTpl = false;
          this.displayFilters = false;
        } else {
          this.displayFilters = true;
        }
      });
    });
  }

  /**
   * Display or hide the main Pia data.
   * @memberof SummaryComponent
   */
  displayMainContent() {
    this.displayMainPiaData = !this.displayMainPiaData;
  }

  /**
   * Display or hide the main Pia data.
   * @memberof SummaryComponent
   */
  displayContextContent() {
    const contextSection = this.el.nativeElement.querySelector('.section-1');
    contextSection.classList.toggle('hide');
  }

  /**
   * Display or hide the main Pia data.
   * @memberof SummaryComponent
   */
  displayFundamentalPrinciplesContent() {
    const fundamentalPrinciplesSection = this.el.nativeElement.querySelector('.section-2');
    fundamentalPrinciplesSection.classList.toggle('hide');
  }

  /**
   * Display or hide the main Pia data.
   * @memberof SummaryComponent
   */
  displayRisksContent() {
    const risksSection = this.el.nativeElement.querySelector('.section-3');
    risksSection.classList.toggle('hide');
  }

  /**
   * Display or hide the action plan.
   * @memberof SummaryComponent
   */
  displayActionPlanContent() {
    this.displayActionPlan = !this.displayActionPlan;
  }

  /**
   * Switch from Pia overview to action plan overview, and vice versa.
   * @memberof SummaryComponent
   */
  displayPiaSummary() {
    const filtersBlock = this.el.nativeElement.querySelector('.pia-summaryFiltersBlock');
    const displayFilters = this.el.nativeElement.querySelector('.pia-summaryFiltersBlock input');
    if (displayFilters) {
      [].forEach.call(displayFilters, function (filter) {
        filter.checked = true;
      });
    }
    this.showPiaTpl = !this.showPiaTpl;
    this.displayFilters = !this.displayFilters;
    this.displayMainPiaData = true;
    this.displayActionPlan = true;
  }

  /**
   * Prepare and display the PIA information.
   * @memberof SummaryComponent
   */
  async showPia() {
    this.prepareHeader();

    this._actionPlanService.data = this.dataNav;
    this._actionPlanService.pia = this.pia;

    this._attachmentsService.pia = this.pia;
    this._attachmentsService.listAttachments().then(() => {
      const attachmentElement = { title: 'summary.attachments', subtitle: null, data: [] };
      this._attachmentsService.attachments.forEach((attachment) => {
        attachmentElement.data.push({
          content: attachment.name,
          comment: attachment.comment
        });
      });
      this.content.push(attachmentElement);
    });

    this.getJsonInfo();
    this._actionPlanService.listActionPlan(this._translateService);
  }

  /**
   * Prepare and display the ActionPlan information.
   * @memberof SummaryComponent
   */
  showActionPlan() {
    this._actionPlanService.data = this.dataNav;
    this._actionPlanService.pia = this.pia;
    this._actionPlanService.listActionPlan(this._translateService);
  }

  /**
   * Get PIA information.
   * @private
   * @memberof SummaryComponent
   */
  private prepareHeader() {
    const el = { title: 'summary.title', data: [] };

    if (this.pia.name && this.pia.name.length > 0) {
      el.data.push({
        title: 'summary.pia_name',
        content: this.pia.name
      });
    }
    if (this.pia.author_name && this.pia.author_name.length > 0) {
      el.data.push({
        title: 'summary.pia_author',
        content: this.pia.author_name
      });
    }
    if (this.pia.evaluator_name && this.pia.evaluator_name.length > 0) {
      el.data.push({
        title: 'summary.pia_assessor',
        content: this.pia.evaluator_name
      });
    }
    if (this.pia.validator_name && this.pia.validator_name.length > 0) {
      el.data.push({
        title: 'summary.pia_validator',
        content: this.pia.validator_name
      });
    }
    if (this.pia.created_at) {
      el.data.push({
        title: 'summary.creation_date',
        type: 'date',
        content: this.pia.created_at
      });
    }
    if (this.pia.dpos_names && this.pia.dpos_names.length > 0) {
      el.data.push({
        title: 'summary.dpo_name',
        content: this.pia.dpos_names
      });
    }
    if (this.pia.dpo_status && this.pia.dpo_status.length > 0) {
      el.data.push({
        title: 'summary.dpo_status',
        content: this.pia.getOpinionsStatus(this.pia.dpo_status.toString())
      });
    }
    if (this.pia.dpo_opinion && this.pia.dpo_opinion.length > 0) {
      el.data.push({
        title: 'summary.dpo_opinion',
        content: this.pia.dpo_opinion
      });
    }

    // Searched opinion for concerned people
    if (this.pia.concerned_people_searched_opinion === true) {
      el.data.push({
        title: 'summary.concerned_people_searched_opinion',
        content: this.pia.getPeopleSearchStatus(this.pia.concerned_people_searched_opinion)
      });
      if (this.pia.people_names && this.pia.people_names.length > 0) {
        el.data.push({
          title: 'summary.concerned_people_name',
          content: this.pia.people_names
        });
      }
      if (this.pia.concerned_people_status >= 0) {
        el.data.push({
          title: 'summary.concerned_people_status',
          content: this.pia.getOpinionsStatus(this.pia.concerned_people_status.toString())
        });
      }
      if (this.pia.concerned_people_opinion && this.pia.concerned_people_opinion.length > 0) {
        el.data.push({
          title: 'summary.concerned_people_opinion',
          content: this.pia.concerned_people_opinion
        });
      }
    }

    // Unsearched opinion for concerned people
    if (this.pia.concerned_people_searched_opinion === false) {
      el.data.push({
        title: 'summary.concerned_people_searched_opinion',
        content: this.pia.getPeopleSearchStatus(this.pia.concerned_people_searched_opinion)
      });
      if (this.pia.concerned_people_searched_content && this.pia.concerned_people_searched_content.length > 0) {
        el.data.push({
          title: 'summary.concerned_people_unsearched_opinion_comment',
          content: this.pia.concerned_people_searched_content
        });
      }
    }

    if (this.pia.applied_adjustements && this.pia.applied_adjustements.length > 0) {
      el.data.push({
        title: 'summary.modification_made',
        content: this.pia.applied_adjustements
      });
    }
    if (this.pia.rejected_reason && this.pia.rejected_reason.length > 0) {
      el.data.push({
        title: 'summary.rejection_reason',
        content: this.pia.rejected_reason
      });
    }

    this.content.push(el);
  }

  /**
   * Get information from the JSON file.
   * @returns {Promise}
   * @private
   * @memberof SummaryComponent
   */
  private async getJsonInfo() {
    this.allData = {}
    this._piaService.data.sections.forEach(async (section) => {
      this.allData[section.id] = {};
      section.items.forEach(async (item) => {
        this.allData[section.id][item.id] = {}
        const ref = section.id.toString() + '.' + item.id.toString();
        if (item.is_measure) {
          this.allData[section.id][item.id] = []
          const measuresModel = new Measure();
          measuresModel.pia_id = this.pia.id;
          const entries: any = await measuresModel.findAll();
          entries.forEach(async (measure) => {
            if (measure.title !== undefined && measure.content !== undefined) {
              this.allData[section.id][item.id].push({
                title: measure.title,
                content: measure.content,
                evaluation: null
              })
              if (item.evaluation_mode === 'question') {
                const evaluation = await this.getEvaluation(section.id, item.id, ref + '.' + measure.id);
                this.allData[section.id][item.id].evaluation = evaluation;
              }
            }
          });
        } else if (item.questions) {
          item.questions.forEach(async (question) => {
            this.allData[section.id][item.id][question.id] = {}
            const answerModel = new Answer();
            await answerModel.getByReferenceAndPia(this.pia.id, question.id);
            if (answerModel.data) {
              const content = [];
              if (answerModel.data.gauge && answerModel.data.gauge > 0) {
                content.push(this._translateService.instant(this.pia.getGaugeName(answerModel.data.gauge)));
              }
              if (answerModel.data.text && answerModel.data.text.length > 0) {
                content.push(answerModel.data.text);
              }
              if (answerModel.data.list && answerModel.data.list.length > 0) {
                content.push(answerModel.data.list.join(', '));
              }
              if (content.length > 0) {
                if (item.evaluation_mode === 'question') {
                  const evaluation = await this.getEvaluation(section.id, item.id, ref + '.' + question.id);
                  this.allData[section.id][item.id][question.id].evaluation = evaluation;
                }
                this.allData[section.id][item.id][question.id].content = content.join(', ')
              }
            }
          });
        }
        if (item.evaluation_mode === 'item') {
          const evaluation = await this.getEvaluation(section.id, item.id, ref);
          this.allData[section.id][item.id]['evaluation_item'] = evaluation;
        }
      });
    });
  }

  /**
   * Get an evaluation by reference.
   * @private
   * @param {string} section_id - The section id.
   * @param {string} item_id - The item id.
   * @param {string} ref - The reference.
   * @returns {Promise}
   * @memberof SummaryComponent
   */
  private async getEvaluation(section_id: string, item_id: string, ref: string) {
    return new Promise(async (resolve, reject) => {
      let evaluation = null;
      const evaluationModel = new Evaluation();
      const exist = await evaluationModel.getByReference(this.pia.id, ref);
      if (exist) {
        evaluation = {
          'title': evaluationModel.getStatusName(),
          'action_plan_comment': evaluationModel.action_plan_comment,
          'evaluation_comment': evaluationModel.evaluation_comment,
          'gauges': {
            'riskName': { value: this._translateService.instant('sections.' + section_id + '.items.' + item_id + '.title') },
            'seriousness': evaluationModel.gauges ? evaluationModel.gauges.x : null,
            'likelihood': evaluationModel.gauges ? evaluationModel.gauges.y : null
          }
        };
      }
      resolve(evaluation);
    });
  }
  
  /**
   * Select all text from page.
   * @memberof Angular2Csv
   */
  getTextSelection() {
    const select = document.getElementById('force-select-all');
    select.focus();
    const range = document.createRange();
    range.selectNodeContents(select);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('Copy', false, range);
    document.execCommand('SelectText', false , range);
    this._modalService.openModal('modal-select-text-pia');
  }

  /**
   * Get a csv document.
   * @protected
   * @returns {Object}
   * @memberof Angular2Csv
   */
  protected async download() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: false,
      headers: [
        this._translateService.instant('summary.csv_section'),
        this._translateService.instant('summary.csv_title_object'),
        this._translateService.instant('summary.csv_comments'),
        this._translateService.instant('summary.csv_implement_date'),
        this._translateService.instant('summary.csv_people_in_charge')
      ]
    }
    new Angular2Csv(this._actionPlanService.csvRows,
      this._translateService.instant('summary.csv_file_title'), options);
  }
}

