import { Component, OnInit, Output, OnDestroy, DoCheck } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { KnowledgeBaseService } from './knowledge-base/knowledge-base.service';
import { MeasureService } from './entry-content/measures/measures.service';
import { ActionPlanService } from './entry-content/action-plan/action-plan.service';
import { PiaService } from './pia.service';
import { ModalsService } from '../modals/modals.service';
import { AppDataService } from '../services/app-data.service';
import { SidStatusService } from '../services/sid-status.service';
import { GlobalEvaluationService } from '../services/global-evaluation.service';

// new import
import { PiaModel, AnswerModel } from '@api/models';
import { PiaApi, AnswerApi } from '@api/services';



@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  providers: []
})
export class EntryComponent implements OnInit, OnDestroy, DoCheck {
  section: { id: number, title: string, short_help: string, items: any };
  item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  data: { sections: any };
  questions: any;
  measureToRemoveFromTags: string;
  subscription: Subscription;

  constructor(private route: ActivatedRoute,
    private _modalsService: ModalsService,
    private _appDataService: AppDataService,
    private _sidStatusService: SidStatusService,
    private _knowledgeBaseService: KnowledgeBaseService,
    private _piaService: PiaService,
    private _actionPlanService: ActionPlanService,
    private _globalEvaluationService: GlobalEvaluationService,
    private _measureService: MeasureService,
    private answerApi: AnswerApi

  ) { }

  async ngOnInit() {
    let sectionId = parseInt(this.route.snapshot.params['section_id'], 10);
    let itemId = parseInt(this.route.snapshot.params['item_id'], 10);

    this._globalEvaluationService.answerEditionEnabled = true;

    this.data = await this._appDataService.getDataNav();
    this.route.params.subscribe(
      (params: Params) => {
        sectionId = parseInt(params['section_id'], 10);
        itemId = parseInt(params['item_id'], 10);
        this.getSectionAndItem(sectionId, itemId);
        window.scroll(0, 0);
      }
    );

    // Suscribe to measure service messages
    this.subscription = this._measureService.behaviorSubject.subscribe((val) => {
      this.measureToRemoveFromTags = val;
    });
  }

  async ngDoCheck() {
    if (this.measureToRemoveFromTags && this.measureToRemoveFromTags.length > 0) {
      const measureName = this.measureToRemoveFromTags;
      this.measureToRemoveFromTags = null;

      // Update tags when removing measures from 3.1
      const itemsQuestions = [];
      this._piaService.data.sections.forEach(section => {
        section.items.forEach(item => {
          if (item.questions) {
            itemsQuestions.push(item.questions.filter((question) => {
              return (question.answer_type === 'list' && question.is_measure === true);
            }));
          }
        });
      });

      // Keep only questions with measures lists
      const listQuestions = itemsQuestions.filter(v => Object.keys(v).length !== 0);
      const theAnswers: AnswerModel[] = await this.answerApi.getAll(this._piaService.pia.id).toPromise();

      listQuestions.forEach(questionsSet => {
        questionsSet.forEach(q => {

          const theRefAnswer = theAnswers.find((a) => {
            return parseInt(a.reference_to, 10) === q.id;
          });

          if (theRefAnswer && theRefAnswer.data.list.length > 0 && theRefAnswer.data.list.includes(measureName)) {
            const index = theRefAnswer.data.list.indexOf(measureName);
            theRefAnswer.data.list.splice(index, 1);
            this.answerApi.update(theRefAnswer).subscribe();
          }
        });
      });

      // For each of these questions, get their respective answer
      // listQuestions.forEach(questionsSet => {
      //   questionsSet.forEach(q => {
      //
      //     this.answerApi.getByRef(this._piaService.pia.id, q.id).subscribe((theAnswer: AnswerModel) => {
      //       if (theAnswer.data && theAnswer.data.list.length > 0 && theAnswer.data.list.includes(measureName)) {
      //         const index = theAnswer.data.list.indexOf(measureName);
      //         theAnswer.data.list.splice(index, 1);
      //         this.answerApi.update(theAnswer).subscribe();
      //
      //       }
      //     });
      //   });
      // });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Get the current Section and Item and initialize others information.
   * @private
   * @param {number} sectionId - The section id.
   * @param {number} itemId - The item id.
   * @memberof EntryComponent
   */
  private getSectionAndItem(sectionId: number, itemId: number) {
    this.section = this.data['sections'].filter((section) => {
      return section.id === sectionId;
    })[0];
    this.item = this.section['items'].filter((item) => {
      return item.id === itemId;
    })[0];

    this._globalEvaluationService.section = this.section;
    this._globalEvaluationService.item = this.item;

    this.questions = [];
    if (this.item['questions']) {
      this.item['questions'].forEach(question => {
        this.questions.push(question);
      });
    }


    this._globalEvaluationService.pia = this._piaService.pia;
    this._globalEvaluationService.validate();
    this._measureService.listMeasures(this._piaService.pia.id).then(() => {

      /* Modal for risks if no measures yet */
      let displayModal = true;
      if ((this.section.id === 3) && (this.item.id === 2 || this.item.id === 3 || this.item.id === 4)) {
        if (this._measureService.measures.length > 0) {
          this._measureService.measures.forEach(element => {
            if (element.title && element.title.length > 0) {
              displayModal = false;
            }
          });
        }
        if (displayModal) {
          this._modalsService.openModal('pia-declare-measures');
        }
      }

      /* Modal for action plan if no evaluations yet */
      if (this.section.id === 4 && this.item.id === 2 && !this._sidStatusService.verifEnableActionPlan()) {
        this._modalsService.openModal('pia-action-plan-no-evaluation');
      }

      /* Modal for dpo page if all evaluations are not done yet */
      if (this.section.id === 4 && this.item.id === 3 && !this._sidStatusService.enableDpoValidation) {
        this._modalsService.openModal('pia-dpo-missing-evaluations');
      }

    });

    this._actionPlanService.data = this.data;
    this._actionPlanService.pia = this._piaService.pia;


    // Update on knowledge base (scroll / content / search field)
    const knowledgeBaseScroll = document.querySelector('.pia-knowledgeBaseBlock-list');
    const knowledgeBaseContent = <HTMLInputElement>document.querySelector('.pia-knowledgeBaseBlock-searchForm input');
    knowledgeBaseScroll.scrollTop = 0;
    knowledgeBaseContent.value = '';

    this._knowledgeBaseService.q = null;
    this._knowledgeBaseService.loadByItem(this.item);
    this._knowledgeBaseService.placeholder = null;
  }
}
