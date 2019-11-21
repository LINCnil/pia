import { Component, ElementRef, OnInit, AfterViewChecked } from '@angular/core';

import { Answer } from 'src/app/entry/entry-content/questions/answer.model';
import { Measure } from 'src/app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'src/app/entry/entry-content/evaluations/evaluation.model';

import { ActionPlanService } from 'src/app/entry/entry-content/action-plan//action-plan.service';
import { PiaService } from 'src/app/services/pia.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { AttachmentsService } from 'src/app/entry/attachments/attachments.service';
import { RevisionService } from 'src/app/services/revision.service';
import { ModalsService } from '../modals/modals.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: [
    './preview.component.scss',
    '../entry/entry-content/action-plan/action-plan.component.scss'
  ],
  providers: [PiaService, RevisionService, ModalsService]
})
export class PreviewComponent implements OnInit {
  public activeElement: string;
  data: { sections: any };
  content: any[];
  dataNav: any;
  pia: any;
  allData: object;
  fromArchives = false;
  public revisions = null;

  constructor(public _actionPlanService: ActionPlanService,
              private el: ElementRef,
              private _translateService: TranslateService,
              public _piaService: PiaService,
              private _appDataService: AppDataService,
              public _attachmentsService: AttachmentsService,
              public _revisionService: RevisionService,
              public _modalsService: ModalsService) { }

  async ngOnInit() {

    this.content = [];
    this.dataNav = this._appDataService.dataNav;

    this._piaService.getPIA().then(() => {
      this.pia = this._piaService.pia;
      this._piaService.calculPiaProgress(this.pia);
      this.showPia();
      this._attachmentsService.pia = this.pia;
      this._attachmentsService.listAttachments();

      if (this.pia.is_archive === 1) {
        this.fromArchives = true;
      }

      // Load PIA's revisions
      this._revisionService.getAll(this.pia.id)
      .then((resp) => {
        this.revisions = resp;
      });

    });
    if (this._piaService.pia.structure_data) {
      this._appDataService.dataNav = this._piaService.pia.structure_data;
    }
    this.data = this._appDataService.dataNav;

  }

  onNewRevision() {
    this._piaService.export(this.pia.id)
      .then((exportResult) => {
        this._revisionService.add(exportResult, this.pia.id)
          .then((resp) => {
            this.revisions.push(resp);
          });
      });

  }

  onSelectedRevision(piaId) {
    this._revisionService.prepareRevision(piaId);
    this._modalsService.openModal('revision-selection');
  }

  loadPiaRevision() {
    this._revisionService.loadRevision();
  }


  ngAfterViewChecked() {
    // scroll spy
    const sections = document.querySelectorAll('.pia-fullPreviewBlock-headline-title h2') as NodeListOf<HTMLElement>;
    const menus = document.querySelectorAll('.pia-sectionBlock-body li a') as NodeListOf<HTMLElement>;
    window.onscroll = () => {
      const scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
      sections.forEach(s => {
        if (s.offsetTop < scrollPosition + 100) {
          menus.forEach(l => {
            l.classList.remove('active');
            if (l.innerText === s.innerText) {
              l.setAttribute('class', 'active');
            }
          });
        }
      });
    };
  }

  /**
   * Jump to the title/subtitle clicked.
   * @param {any} event - Any Event.
   * @param {any} text - The title or subtitle.
   */
  getAnchor(event, text) {
    event.preventDefault();
    const allSubtitles = document.querySelectorAll('h2');
    allSubtitles.forEach.call(allSubtitles, (el, i) => {
      if (el.innerText === this._translateService.instant(text)) {
        el.parentNode.scrollIntoView({ behavior: 'instant' });
      }
    });
  }


  /**
   * Prepare and display the PIA information
   */
  async showPia() {
    this.prepareDpoData();
    this._actionPlanService.data = this.dataNav;
    this._actionPlanService.pia = this.pia;
    this._actionPlanService.listActionPlan();
    this.getJsonInfo();
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
