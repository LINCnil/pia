import { Component, ElementRef, OnInit, AfterViewChecked } from '@angular/core';

import * as html2canvas from 'html2canvas';
import { saveSvgAsPng, svgAsPngUri } from 'save-svg-as-png';
import * as FileSaver from 'file-saver';

import { Answer } from 'src/app/entry/entry-content/questions/answer.model';
import { Measure } from 'src/app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'src/app/entry/entry-content/evaluations/evaluation.model';

import { ActionPlanService } from 'src/app/entry/entry-content/action-plan//action-plan.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { PiaService } from 'src/app/services/pia.service';

declare const require: any;

@Component({
  selector: 'app-preview-data',
  templateUrl: './preview-data.component.html',
  styleUrls: [
    './preview-data.component.scss',
    '../../entry/entry-content/action-plan/action-plan.component.scss'
  ],
  providers: [PiaService]
})
export class PreviewDataComponent implements OnInit, AfterViewChecked {
  csvOptions = {};
  csvContent: any;
  content: any[];
  dataNav: any;
  pia: any;
  allData: object;

  constructor(private el: ElementRef,
              private _appDataService: AppDataService,
              public _piaService: PiaService,
              public _actionPlanService: ActionPlanService,
              private _translateService: TranslateService) { }

  ngOnInit() {
    this.content = [];
    this.dataNav = this._appDataService.dataNav;

    this._piaService.getPIA().then(() => {
      this.pia = this._piaService.pia;
      this._piaService.calculPiaProgress(this.pia);
      this.showPia();
    });
  }

  ngAfterViewChecked() {
    document.querySelector('angular2csv > button').innerHTML = '<i class="fa fa-2x fa-file-excel-o"></i>';
  }

  /**
   * Download all graphs as images
   * @private
   */
  async downloadAllGraphsAsImages() {
    const JSZip = require('jszip');
    const zip = new JSZip();
    this.addImagesToZip(zip).then((zip2: any) => {
      zip2.generateAsync({type: 'blob'}).then(blobContent => {
        FileSaver.saveAs(blobContent, 'pia-images.zip');
      });
    });
  }

  /**
   *
   * @param element block in the HTML view used to generate the docx
   */
  async generateDocx(element) {
    setTimeout(() => {
      const dataDoc = this.prepareDocFile(element);

      const downloadLink = document.createElement('a');
      document.body.appendChild(downloadLink);
      if (navigator.msSaveOrOpenBlob ) {
          navigator.msSaveOrOpenBlob(dataDoc.blob, dataDoc.filename);
      } else {
          downloadLink.href = dataDoc.url;
          downloadLink.download = dataDoc.filename;
          downloadLink.click();
      }
      document.body.removeChild(downloadLink);
    }, 500);
  }

  /**
   * Generate a ZIP with the docx + all pictures
   * @param element block in the HTML view used to generate the docx in the zip
   */
  async generateZip(element) {
    setTimeout(() => {
      const dataDoc = this.prepareDocFile(element);
      const JSZip = require('jszip');
      const zip = new JSZip();
      this.addImagesToZip(zip).then((zip2: any) => {
        zip2.file(dataDoc.filename, dataDoc.blob);
        zip2.generateAsync({type: 'blob'}).then(blobContent => {
          FileSaver.saveAs(blobContent, 'pia-' + this.pia.name + '.zip');
        });
      });
    }, 500);
  }

  /**
   * Prepare .doc file
   */
  prepareDocFile(element) {
    const actionPlanImg = document.querySelector('#actionPlanOverviewImg');
    if (actionPlanImg) {
      document.querySelector('#actionPlanOverviewImg').remove();
    }
    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const postHtml = '</body></html>';
    const html = preHtml + document.getElementById(element).innerHTML + postHtml;
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const actionPlanBlock = document.querySelector('.pia-actionPlanGraphBlockContainer');
    if (actionPlanBlock) {
      actionPlanBlock.appendChild(actionPlanImg);
    }
    return { url: 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html), blob, filename: 'pia.doc' };
  }

  /**
   * Prepare for CSV export
   */
  prepareCsv() {
    this.csvOptions = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: true,
      removeNewLines: true,
      headers: [
        `"${this._translateService.instant('summary.csv_section')}"`,
        `"${this._translateService.instant('summary.csv_title_object')}"`,
        `"${this._translateService.instant('summary.csv_action_plan_comment')}"`,
        `"${this._translateService.instant('summary.csv_evaluation_comment')}"`,
        `"${this._translateService.instant('summary.csv_implement_date')}"`,
        `"${this._translateService.instant('summary.csv_people_in_charge')}"`
      ]
    };
    this.csvContent = this._actionPlanService.csvRows;
  }

  async addImagesToZip(zip) {
    return new Promise(async (resolve, reject) => {
      const actionPlanOverviewImg = await this.getActionPlanOverviewImg();
      const risksCartographyImg = await this.getRisksCartographyImg();
      const risksOverviewImg = await this.getRisksOverviewImgForZip();

      const byteCharacters1 = atob((actionPlanOverviewImg as any).split(',')[1]);
      const byteCharacters2 = atob((risksCartographyImg as any).split(',')[1]);
      const byteCharacters3 = atob((risksOverviewImg as any).split(',')[1]);

      zip.file('actionPlanOverview.png', byteCharacters1, {binary: true});
      zip.file('risksCartography.png', byteCharacters2, {binary: true});
      zip.file('risksOverview.png', byteCharacters3, {binary: true});

      resolve(zip);
    });
  }

  /**
   * Download the action plan overview as an image
   * @async
   */
  async getActionPlanOverviewImg() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const actionPlanOverviewImg = document.querySelector('#actionPlanOverviewImg');
        if (actionPlanOverviewImg) {
          html2canvas(actionPlanOverviewImg, {scale: 1.4}).then(canvas => {
            if (canvas) {
              const img = canvas.toDataURL();
              resolve(img);
            }
          });
        }
      }, 250);
    });
  }

  /**
   * Download the risks overview as an image
   * @private
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
    }, 250);
  }

  /**
   * Generate a data format from the risk overview image. It can then be used in the Zip.
   * @async
   */
  async getRisksOverviewImgForZip() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          const mysvg = document.getElementById('risksOverviewSvg');
          if (mysvg) {
            svgAsPngUri(mysvg, {}, uri => {
              resolve(uri);
            });
          }
      }, 250);
    });
  }

  /**
   * Download the risks cartography as an image
   * @async
   */
  async getRisksCartographyImg() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const risksCartographyImg = document.querySelector('#risksCartographyImg');
        if (risksCartographyImg) {
          html2canvas(risksCartographyImg, {scale: 1.4}).then(canvas => {
            if (canvas) {
              const img = canvas.toDataURL();
              resolve(img);
            }
          });
        }
      }, 250);
    });
  }

  /**
   * Prepare and display the PIA information
   */
  async showPia() {
    this.prepareDpoData();
    this._actionPlanService.data = this.dataNav;
    this._actionPlanService.pia = this.pia;

    this.getJsonInfo();
    this._actionPlanService.listActionPlan();
  }

  /**
   * Get PIA information.
   * @private
   */
  private prepareDpoData() {
    const el = { title: 'summary.title', data: [] };
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

}
