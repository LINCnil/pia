import { Component, ElementRef, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import {element} from 'protractor';
import * as html2canvas from 'html2canvas';
import { saveSvgAsPng } from 'save-svg-as-png';
import { Angular2Csv } from 'angular2-csv';

import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';
import { AppDataService } from 'app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalsService } from '../modals/modals.service';
import { PiaService } from 'app/services/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: [
    './summary.component.scss',
    '../entry/entry-content/action-plan/action-plan.component.scss'
  ],
  providers: [PiaService]
})
export class SummaryComponent implements OnInit {

  content: any[];
  pia: any;
  allData: Object;
  dataNav: any;
  displayMainPiaData: boolean;
  displayActionPlan: boolean;
  summarySubscription: Subscription;
  displayOnlyActionPlan: boolean;
  displayRisksOverview: boolean;
  displayRisksCartography: boolean;

  constructor(private el: ElementRef,
              private route: ActivatedRoute,
              private _attachmentsService: AttachmentsService,
              public _actionPlanService: ActionPlanService,
              private _translateService: TranslateService,
              private _appDataService: AppDataService,
              public _piaService: PiaService,
              private _modalService: ModalsService) { }

  async ngOnInit() {
    this.summarySubscription = this.route.queryParams.subscribe(params => {
      this.displayOnlyActionPlan = params['displayOnlyActionPlan'];
    });

    this.content = [];
    this.dataNav = await this._appDataService.getDataNav();

    this._piaService.getPIA().then(() => {
      this.pia = this._piaService.pia;
      this.displayMainPiaData = true;
      this.displayActionPlan = true;
      this.displayRisksOverview = true;
      this.displayRisksCartography = true;
      this.showPia().then(() => {
        // Disable all filters (except action plan) if displaying only action plan
        if (this.displayOnlyActionPlan) {
          this.toggleMainContent();
          this.toggleContextContent();
          this.toggleFundamentalPrinciplesContent();
          this.toggleRisksContent();
          this.toggleRisksOverviewContent();
          this.toggleRisksCartographyContent();
        }
      });
    });
  }

  /**
   * Download all graphs as images
   * @private
   * @memberof SummaryComponent
   */
  downloadAllGraphsAsImages() {
    this.getActionPlanOverviewImg();
    this.getRisksOverviewImg();
    this.getRisksCartographyImg();
  }

  /**
   * Download the action plan overview as an image
   * @private
   * @memberof SummaryComponent
   */
  private getActionPlanOverviewImg() {
    setTimeout(() => {
      const actionPlanOverviewImg = document.querySelector('#actionPlanOverviewImg');
      if (actionPlanOverviewImg) {
        html2canvas(actionPlanOverviewImg, {scale: 1.4}).then(canvas => {
          if (canvas) {
            const img = canvas.toDataURL();
            this.downloadURI(img, 'actionPlanOverview.png');
          }
        });
      }
    }, 500);
  }

  /**
   * Download the risks overview as an image
   * @private
   * @memberof SummaryComponent
   */
  private getRisksOverviewImg() {
    setTimeout(() => {
        const mysvg = document.getElementById('risksOverviewSvg');
        if (mysvg) {
          saveSvgAsPng(mysvg, 'risksOverview.png', {
            backgroundColor: 'white',
            scale: 1.4,
            encoderOptions: 1,
            width: 760});
        }
    }, 500);
  }

  /**
   * Download the risks cartography as an image
   * @private
   * @memberof SummaryComponent
   */
  private getRisksCartographyImg() {
    setTimeout(() => {
      const risksCartographyImg = document.querySelector('#risksCartographyImg');
      if (risksCartographyImg) {
        html2canvas(risksCartographyImg, {scale: 1.4}).then(canvas => {
          if (canvas) {
            const img = canvas.toDataURL();
            this.downloadURI(img, 'risksCartography.png');
          }
        });
      }
    }, 500);
  }

  /**
   * Generate a link to download the different images in the summary
   * @private
   * @param {uri} uri identifiant URI de l'image
   * @param {string} name name of the image
   * @memberof SummaryComponent
   */
  private downloadURI(uri, name) {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
  }

  /**
   * Display or hide the main Pia data.
   * @private
   * @memberof SummaryComponent
   */
  toggleMainContent() {
    this.displayMainPiaData = !this.displayMainPiaData;
  }

  /**
   * Display or hide the main Pia data.
   * @private
   * @memberof SummaryComponent
   */
  toggleContextContent() {
    setTimeout(() => {
      const contextSection = this.el.nativeElement.querySelector('.section-1');
      contextSection.classList.toggle('hide');
    }, 100);
  }

  /**
   * Display or hide the main Pia data.
   * @private
   * @memberof SummaryComponent
   */
  toggleFundamentalPrinciplesContent() {
    setTimeout(() => {
      const fundamentalPrinciplesSection = this.el.nativeElement.querySelector('.section-2');
      fundamentalPrinciplesSection.classList.toggle('hide');
    }, 100);
  }

  /**
   * Display or hide the main Pia data.
   * @private
   * @memberof SummaryComponent
   */
  toggleRisksContent() {
    setTimeout(() => {
      const risksSection = this.el.nativeElement.querySelector('.section-3');
      risksSection.classList.toggle('hide');
    }, 100);
  }

  /**
   * Display or hide the action plan.
   * @private
   * @memberof SummaryComponent
   */
  toggleActionPlanContent() {
    this.displayActionPlan = !this.displayActionPlan;
  }

  /**
   * Display or hide the risks overview for the current PIA.
   * @private
   * @memberof SummaryComponent
   */
  toggleRisksOverviewContent() {
    this.displayRisksOverview = !this.displayRisksOverview;
  }

  /**
   * Display or hide the risks cartography for the current PIA.
   * @private
   * @memberof SummaryComponent
   */
  toggleRisksCartographyContent() {
    this.displayRisksCartography = !this.displayRisksCartography;
  }

  /**
   * Prepare and display the PIA information
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
    this._actionPlanService.listActionPlan();
  }

  /**
   * Prepare and display the ActionPlan information.
   * @private
   * @memberof SummaryComponent
   */
  private showActionPlan() {
    this._actionPlanService.data = this.dataNav;
    this._actionPlanService.pia = this.pia;
    this._actionPlanService.listActionPlan();
  }

  /**
   * Get a csv document.
   * @protected
   * @returns {Object}
   * @memberof Angular2Csv
   */
  public async download() {
    const options = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: true,
      headers: [
        this._translateService.instant('summary.csv_section'),
        this._translateService.instant('summary.csv_title_object'),
        this._translateService.instant('summary.csv_action_plan_comment'),
        this._translateService.instant('summary.csv_evaluation_comment'),
        this._translateService.instant('summary.csv_implement_date'),
        this._translateService.instant('summary.csv_people_in_charge')
      ]
    }

    this._actionPlanService.getCsv();

    return new Angular2Csv(this._actionPlanService.csvRows,
                           this._translateService.instant('summary.csv_file_title'),
                           options);
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

        // Measure
        if (item.is_measure) {
          this.allData[section.id][item.id] = []
          const measuresModel = new Measure();
          measuresModel.pia_id = this.pia.id;
          const entries: any = await measuresModel.findAll();
          entries.forEach(async (measure) => {
            /* Completed measures */
            if (measure.title !== undefined && measure.content !== undefined) {
              let evaluation = null;
              if (item.evaluation_mode === 'question') {
                evaluation = await this.getEvaluation(section.id, item.id, ref + '.' + measure.id);
              }
              this.allData[section.id][item.id].push({
                title: measure.title,
                content: measure.content,
                evaluation: evaluation
              })
            }
          });
        } else if (item.questions) { // Question
          item.questions.forEach(async (question) => {
            this.allData[section.id][item.id][question.id] = {}
            const answerModel = new Answer();
            await answerModel.getByReferenceAndPia(this.pia.id, question.id);

            /* An answer exists */
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
   * @private
   * @memberof Angular2Csv
   */
  getTextSelection() {
    const actionPlanOverview = document.getElementById('actionPlanOverviewImg');
    if (actionPlanOverview) {
      actionPlanOverview.classList.toggle('hide');
    }
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
    if (actionPlanOverview) {
      actionPlanOverview.classList.toggle('hide');
    }
  }
}

