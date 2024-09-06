import {
  Component,
  OnInit,
  AfterViewChecked,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PiaService } from 'src/app/services/pia.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { RevisionService } from 'src/app/services/revision.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { Answer } from 'src/app/models/answer.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { Revision } from 'src/app/models/revision.model';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AnswerService } from 'src/app/services/answer.service';
import { Pia } from 'src/app/models/pia.model';
import { MeasureService } from 'src/app/services/measures.service';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, AfterViewChecked {
  public activeElement: string;
  data: { sections: any };
  content: any[];
  dataNav: any;
  @Input() pia: Pia;
  allData: object;
  fromArchives = false;
  @Input() onlyData = false;
  public revisions = null;
  public revisionOverlay = false;
  @Input() editMode: 'local' | 'author' | 'evaluator' | 'validator' | 'guest' =
    'local';
  public download = false;

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    public actionPlanService: ActionPlanService,
    private translateService: TranslateService,
    public piaService: PiaService,
    private appDataService: AppDataService,
    public revisionService: RevisionService,
    public languagesService: LanguagesService,
    private answerService: AnswerService,
    private measureService: MeasureService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.content = [];
    this.dataNav = this.appDataService.dataNav;

    this.piaService
      .find(parseInt(this.route.snapshot.params.id))
      .then(async (pia: Pia) => {
        this.pia = pia;
        this.actionPlanService.data = this.dataNav;
        this.actionPlanService.pia = this.pia;
        this.showPia();

        if (this.pia.is_archive === 1) {
          this.fromArchives = true;
        }

        // Load PIA's revisions
        const revision = new Revision();
        this.revisionService.findAllByPia(this.pia.id).then(resp => {
          this.revisions = resp;
        });

        if (this.pia.structure_data) {
          this.appDataService.dataNav = this.pia.structure_data;
        }
        this.data = this.appDataService.dataNav;
      });
  }

  ngAfterViewChecked(): void {
    // scroll spy
    const sections = document.querySelectorAll(
      '.pia-fullPreviewBlock-headline-title h2'
    ) as NodeListOf<HTMLElement>;
    const menus = document.querySelectorAll(
      '.pia-sectionBlock-body li a'
    ) as NodeListOf<HTMLElement>;
    window.onscroll = () => {
      const scrollPosition =
        document.documentElement.scrollTop || document.body.scrollTop;
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
  getAnchor(event, text): void {
    event.preventDefault();
    const allSubtitles = document.querySelectorAll('h2');
    allSubtitles.forEach.call(allSubtitles, (el, i) => {
      if (el.innerText === this.translateService.instant(text)) {
        el.parentNode.scrollIntoView({ behavior: 'instant' });
      }
    });
  }

  /**
   * Prepare and display the PIA information
   */
  async showPia(): Promise<void> {
    this.prepareDpoData();
    this.actionPlanService.listActionPlan();
    this.getJsonInfo();
  }

  /**
   * Get PIA information.
   * @private
   */
  private prepareDpoData(): void {
    const el = { title: 'summary.title', data: [] };
    if (this.pia.dpos_names && this.pia.dpos_names.length > 0) {
      el.data.push({
        title: 'summary.dpo_name',
        content: this.pia.dpos_names
      });
    }
    if (this.pia.dpo_status && this.pia.dpo_status > 0) {
      el.data.push({
        title: 'summary.dpo_status',
        content: this.piaService.getOpinionsStatus(
          this.pia.dpo_status.toString()
        )
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
        content: this.piaService.getPeopleSearchStatus(
          this.pia.concerned_people_searched_opinion
        )
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
          content: this.piaService.getOpinionsStatus(
            this.pia.concerned_people_status.toString()
          )
        });
      }
      if (
        this.pia.concerned_people_opinion &&
        this.pia.concerned_people_opinion.length > 0
      ) {
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
        content: this.piaService.getPeopleSearchStatus(
          this.pia.concerned_people_searched_opinion
        )
      });
      if (
        this.pia.concerned_people_searched_content &&
        this.pia.concerned_people_searched_content.length > 0
      ) {
        el.data.push({
          title: 'summary.concerned_people_unsearched_opinion_comment',
          content: this.pia.concerned_people_searched_content
        });
      }
    }

    if (
      this.pia.applied_adjustments &&
      this.pia.applied_adjustments.length > 0
    ) {
      el.data.push({
        title: 'summary.modification_made',
        content: this.pia.applied_adjustments
      });
    }
    if (this.pia.rejection_reason && this.pia.rejection_reason.length > 0) {
      el.data.push({
        title: 'summary.rejection_reason',
        content: this.pia.rejection_reason
      });
    }

    this.content.push(el);
  }

  /**
   * Get information from the JSON file.
   * @returns {Promise}
   * @private
   */
  private async getJsonInfo(): Promise<void> {
    this.allData = {};
    this.piaService.data.sections.forEach(async section => {
      this.allData[section.id] = {};
      section.items.forEach(async item => {
        this.allData[section.id][item.id] = {};
        const ref = section.id.toString() + '.' + item.id.toString();

        // Measure
        if (item.is_measure) {
          this.allData[section.id][item.id] = [];
          this.measureService.pia_id = this.pia.id;
          const entries: any = await this.measureService.findAllByPia(
            this.pia.id
          );
          entries.forEach(async measure => {
            /* Completed measures */
            if (measure.title !== undefined && measure.content !== undefined) {
              let evaluation = null;
              if (item.evaluation_mode === 'question') {
                evaluation = await this.getEvaluation(
                  section.id,
                  item.id,
                  ref + '.' + measure.id
                );
              }
              this.allData[section.id][item.id].push({
                title: measure.title,
                content: measure.content,
                evaluation
              });
            }
          });
        } else if (item.questions) {
          // Question
          item.questions.forEach(async question => {
            this.allData[section.id][item.id][question.id] = {};
            this.answerService
              .getByReferenceAndPia(this.pia.id, question.id)
              .then((answer: Answer) => {
                /* An answer exists */
                if (answer && answer.data) {
                  const content = [];
                  if (answer.data.gauge && answer.data.gauge > 0) {
                    content.push(
                      this.translateService.instant(
                        this.piaService.getGaugeName(answer.data.gauge)
                      )
                    );
                  }
                  if (answer.data.text && answer.data.text.length > 0) {
                    content.push(answer.data.text);
                  }
                  if (answer.data.list && answer.data.list.length > 0) {
                    content.push(answer.data.list.join(', '));
                  }
                  if (content.length > 0) {
                    if (item.evaluation_mode === 'question') {
                      this.getEvaluation(
                        section.id,
                        item.id,
                        ref + '.' + question.id
                      ).then(evaluation => {
                        this.allData[section.id][item.id][
                          question.id
                        ].evaluation = evaluation;
                      });
                    }
                    this.allData[section.id][item.id][
                      question.id
                    ].content = content.join(', ');
                  }
                }
              });
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
  private async getEvaluation(
    section_id: string,
    item_id: string,
    ref: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let evaluation = null;
      this.evaluationService
        .getByReference(this.pia.id, ref)
        .then((exist: Evaluation) => {
          if (exist) {
            evaluation = {
              title: this.evaluationService.getStatusName(exist.status),
              action_plan_comment: exist.action_plan_comment,
              evaluation_comment: exist.evaluation_comment,
              gauges: {
                seriousness: exist.gauges ? exist.gauges.x : null,
                likelihood: exist.gauges ? exist.gauges.y : null
              }
            };
          }
          resolve(evaluation);
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  getUsersList(type: string, dump_field: string = null): string {
    if (this.authService.state) {
      return this.pia.user_pias
        .filter(up => up.role === type)
        .map(x =>
          x.user.firstname
            ? x.user.firstname + ' ' + x.user.lastname
            : x.user.email
        )
        .join(',');
    } else if (dump_field) {
      return this.pia[dump_field];
    }
  }
}
