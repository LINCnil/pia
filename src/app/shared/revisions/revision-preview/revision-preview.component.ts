import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Pia } from 'src/app/entry/pia.model';
import { Answer } from 'src/app/entry/entry-content/questions/answer.model';

import { AppDataService } from 'src/app/services/app-data.service';
import { Measure } from 'src/app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'src/app/entry/entry-content/evaluations/evaluation.model';
import { TranslateService } from '@ngx-translate/core';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { RevisionService } from 'src/app/services/revision.service';
import { ModalsService } from 'src/app/modals/modals.service';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

@Component({
  selector: 'app-revision-preview',
  templateUrl: './revision-preview.component.html',
  styleUrls: ['./revision-preview.component.scss'],
  providers: [AppDataService]
})
export class RevisionPreviewComponent implements OnInit {
  @Input() revision: any;
  pia: Pia;
  allData: any;
  data: any;
  @Output('selectedRevisionQuery') selectedRevisionEmitter = new EventEmitter();

  constructor(
    private _translateService: TranslateService,
    public _appDataService: AppDataService,
    public _sidStatusService: SidStatusService,
    public _revisionService: RevisionService,
    public _modalsService: ModalsService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.revision && changes.revision.currentValue) {
      // CONSTRUC A NEW PIA FOR THE PREVIEW MODE
      this.pia = new Pia();
      this.pia.id = changes.revision.currentValue.pia.id;
      this.pia.status = changes.revision.currentValue.pia.status;
      this.pia.name = changes.revision.currentValue.pia.name;
      this.pia.category = changes.revision.currentValue.pia.category;
      this.pia.author_name = changes.revision.currentValue.pia.author_name;
      this.pia.evaluator_name = changes.revision.currentValue.pia.evaluator_name;
      this.pia.validator_name = changes.revision.currentValue.pia.validator_name;
      this.pia.dpo_status = changes.revision.currentValue.pia.dpo_status;
      this.pia.dpo_opinion = changes.revision.currentValue.pia.dpo_opinion;
      this.pia.concerned_people_opinion = changes.revision.currentValue.pia.concerned_people_opinion;
      this.pia.concerned_people_status = changes.revision.currentValue.pia.concerned_people_status;
      this.pia.concerned_people_searched_opinion = changes.revision.currentValue.pia.concerned_people_searched_opinion;
      this.pia.concerned_people_searched_content = changes.revision.currentValue.pia.concerned_people_searched_content;
      this.pia.rejected_reason = changes.revision.currentValue.pia.rejected_reason;
      this.pia.applied_adjustements = changes.revision.currentValue.pia.applied_adjustements;
      this.pia.dpos_names = changes.revision.currentValue.pia.dpos_names;
      this.pia.people_names = changes.revision.currentValue.pia.people_names;
      this.pia.is_example = changes.revision.currentValue.pia.is_example;
      this.pia.is_archive = changes.revision.currentValue.pia.is_archive;
      this.pia.structure_id = changes.revision.currentValue.pia.structure_id;
      this.pia.structure_name = changes.revision.currentValue.pia.structure_name;
      this.pia.structure_sector_name = changes.revision.currentValue.pia.structure_sector_name;
      this.pia.structure_data = changes.revision.currentValue.pia.structure_data;

      if (this.pia.structure_data) {
        this._appDataService.dataNav = this.pia.structure_data;
      } else {
        this._appDataService.resetDataNav();
      }

      this.data = this._appDataService.dataNav;
      this.getJsonInfo();

      // CALCUL PROGRESS BAR
      this.pia.progress = 0.0;
      if (this.pia.status > 0) {
        this.pia.progress += 4;
      }
      this.data.sections.forEach((section: any) => {
        section.items.forEach((item: any) => {
          this._sidStatusService.setSidStatus(this.pia, section, item);
        });
      });
    }
  }

  private async getJsonInfo() {
    this.allData = {};
    this.data.sections.forEach(async section => {
      this.allData[section.id] = {};
      section.items.forEach(async item => {
        this.allData[section.id][item.id] = {};
        const ref = section.id.toString() + '.' + item.id.toString();

        // Measure
        if (item.is_measure) {
          this.allData[section.id][item.id] = [];

          const entries: any = this.revision.measures;
          entries.forEach(async measure => {
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
              });
            }
          });
        } else if (item.questions) {
          // Question
          item.questions.forEach(async question => {
            this.allData[section.id][item.id][question.id] = {};

            // Find answer
            const answerModel = new Answer();
            let answer = this.revision.answers.find(a => a.reference_to === question.id);
            if (answer) {
              answerModel.data = this.revision.answers.find(a => a.reference_to === question.id).data;

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
                  this.allData[section.id][item.id][question.id].content = content.join(', ');
                }
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

  private async getEvaluation(section_id: string, item_id: string, ref: string) {
    return new Promise(async (resolve, reject) => {
      let evaluation = null;
      const evaluationModel = new Evaluation();
      // const exist = await evaluationModel.getByReference(this.pia.id, ref);
      const exist = this.revision.evaluations.find(e => e.reference_to === ref);
      if (exist) {
        evaluationModel.id = exist.id;
        evaluationModel.status = exist.status;
        evaluationModel.pia_id = this.pia.id;
        evaluationModel.reference_to = exist.reference_to;
        evaluationModel.action_plan_comment = exist.action_plan_comment;
        evaluationModel.evaluation_comment = exist.evaluation_comment;
        evaluationModel.evaluation_date = exist.evaluation_date;
        evaluationModel.gauges = exist.gauges;
        evaluationModel.estimated_implementation_date = new Date(exist.estimated_implementation_date);
        evaluationModel.person_in_charge = exist.person_in_charge;
        evaluationModel.global_status = exist.global_status;

        evaluation = {
          title: evaluationModel.getStatusName(),
          action_plan_comment: evaluationModel.action_plan_comment,
          evaluation_comment: evaluationModel.evaluation_comment,
          gauges: {
            riskName: {
              value: this._translateService.instant('sections.' + section_id + '.items.' + item_id + '.title')
            },
            seriousness: evaluationModel.gauges ? evaluationModel.gauges.x : null,
            likelihood: evaluationModel.gauges ? evaluationModel.gauges.y : null
          }
        };
      }
      resolve(evaluation);
    });
  }

  public exportJson() {
    const fileTitle = 'pia-' + slugify(this.pia.name) + slugify(new Date(this.pia.created_at));
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    if (navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(this.revision, fileTitle + '.json');
    } else {
      downloadLink.href = this.revision;
      downloadLink.download = fileTitle + '.json';
      downloadLink.click();
    }
  }

  public restoreRevision() {
    this._modalsService.closeModal();
    console.log('hello final');
    this._revisionService.prepareLoadRevision(this.revision.id, this.pia.id).then((createdAt: Date) => {
      this._modalsService.revisionDate = createdAt;
      this._modalsService.openModal('revision-selection');
    });
  }
}
