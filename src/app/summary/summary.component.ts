import { Component, OnInit } from '@angular/core';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';
import { ActivatedRoute, Params } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [PiaService]
})
export class SummaryComponent implements OnInit {

  content: any[];
  pia: any;
  allData: any[];

  constructor(private route: ActivatedRoute,
              private _attachmentsService: AttachmentsService,
              private _actionPlanService: ActionPlanService,
              private _translateService: TranslateService,
              private _piaService: PiaService) { }

  ngOnInit() {
    this.content = [];
    this._piaService.getPIA().then(() => {
      this.pia = this._piaService.pia;
      if (this.route.snapshot.params['type'] === 'pia') {
        this.showPia();
      } else if (this.route.snapshot.params['type'] === 'action_plan') {
        this.showActionPlan();
      }
    });
  }

  showPia() {
    this.prepareHeader();

    this._attachmentsService.pia = this.pia;
    this._attachmentsService.listAttachments().then(() => {
      const attachmentElement = { title: 'summary.attachments', subtitle: null, data: [] };
      this._attachmentsService.attachments.forEach((attachment) => {
        attachmentElement.data.push({ content: attachment.name });
      });
      this.content.push(attachmentElement);
    });

    this.getJsonInfo().then(() => {
      this.allData.forEach((element, index) => {
        const el = { title: element.sectionTitle, subtitle: element.itemTitle, data: [] };
        if (element.questions.length > 0) {
          element.questions.forEach(question => {
            el.data.push({
              title: question.title,
              content: question.content
            });
          });
        }
        this.content.push(el);
      });
    });
  }

  showActionPlan() {
    let el = { title: 'summary.action_plan.fundamental_principles', subtitle: null, data: [] };

    if (this._actionPlanService.noPrinciplesActionPlan) {
      el.data.push({
        title: null,
        content: 'summary.action_plan.no_action_plan'
      });
    } else {
      this._actionPlanService.results.forEach((data: any) => {
        if (data.evaluation.action_plan_comment) {
          el.data.push({
            title: data.short_title,
            content: data.evaluation.action_plan_comment
          });
          if (data.evaluation.estimated_evaluation_date) {
            el.data.push({
              title: 'summary.action_plan.implementation_date',
              content: data.evaluation.estimated_evaluation_date
            });
          }
          if (data.evaluation.person_in_charge) {
            el.data.push({
              title: 'summary.action_plan.implementation_responsible',
              content: data.evaluation.person_in_charge
            });
          }
        }
      });
    }
    this.content.push(el);

    el = { title: 'summary.action_plan.measures', subtitle: null, data: [] };
    if (this._actionPlanService.noMeasuresActionPlan) {
      el.data.push({
        title: null,
        content: 'summary.action_plan.no_action_plan'
      });
    } else {
      this._actionPlanService.measures.forEach((data: any) => {
        if (data.action_plan_comment) {
          el.data.push({
            title: data.short_title,
            content: data.action_plan_comment
          });
        }
      });
    }
    this.content.push(el);

    el = { title: 'summary.action_plan.risks', subtitle: null, data: [] };
    if (this._actionPlanService.noRisksActionPlan) {
      el.data.push({
        title: null,
        content: 'summary.action_plan.no_action_plan'
      });
    } else {
      if (this._actionPlanService.risks['3.2'] && this._actionPlanService.risks['3.2'].action_plan_comment) {
        el.data.push({
          title: this._actionPlanService.risks['3.2'].short_title,
          content: this._actionPlanService.risks['3.2'].action_plan_comment
        });
      }
      if (this._actionPlanService.risks['3.3'] && this._actionPlanService.risks['3.3'].action_plan_comment) {
        el.data.push({
          title: this._actionPlanService.risks['3.3'].short_title,
          content: this._actionPlanService.risks['3.3'].action_plan_comment
        });
      }
      if (this._actionPlanService.risks['3.4'] && this._actionPlanService.risks['3.4'].action_plan_comment) {
        el.data.push({
          title: this._actionPlanService.risks['3.4'].short_title,
          content: this._actionPlanService.risks['3.4'].action_plan_comment
        });
      }
    }
    this.content.push(el);
  }

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
    if (this.pia.dpos_names && this.pia.dpos_names.length > 0) {
      el.data.push({
        title: 'summary.dpo_name',
        content: this.pia.dpos_names
      });
    }
    if ( this.pia.dpo_status >= 0) {
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
    if (this.pia.created_at) {
      el.data.push({
        title: 'summary.creation_date',
        type: 'date',
        content: this.pia.created_at
      });
    }
    this.content.push(el);
  }

  private getJsonInfo() {
    this.allData = [];
    return new Promise((resolve, reject) => {
      if (this._piaService.data) {
        this._piaService.data.sections.forEach((section) => {
          section.items.forEach((item) => {
            const ref = section.id.toString() + item.id.toString();
            this.allData[ref] = {
              sectionTitle: section.title,
              itemTitle: item.title,
              questions: []
            }
            if (item.is_measure) {
              const measuresModel = new Measure();
              measuresModel.pia_id = this.pia.id;
              measuresModel.findAll().then((entries: any) => {
                entries.forEach((measure) => {
                  if (measure.title !== undefined && measure.content !== undefined) {
                    this.allData[ref]['questions'].push({
                      title: measure.title,
                      content: measure.content
                    });
                  }
                });
              });
            } else if (item.questions) {
              item.questions.forEach((question) => {
                const answerModel = new Answer();
                answerModel.getByReferenceAndPia(this.pia.id, question.id).then(() => {
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
                      this.allData[ref]['questions'].push({
                        title: question.title,
                        content: content.join(', ')
                      });
                    }
                  }
                  if (section.id === 3 && item.id === 4) {
                    resolve();
                  }
                });
              });
            }
          });
        });
      }
    });
  }
}
