import { Component, OnInit, OnDestroy, DoCheck } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Answer } from 'src/app/entry/entry-content/questions/answer.model';

import { KnowledgeBaseService } from 'src/app/entry/knowledge-base/knowledge-base.service';
import { MeasureService } from 'src/app/entry/entry-content/measures/measures.service';
import { ActionPlanService } from 'src/app/entry/entry-content/action-plan//action-plan.service';
import { PiaService } from 'src/app/services/pia.service';
import { ModalsService } from 'src/app/modals/modals.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { RevisionService } from '../services/revision.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  providers: [PiaService, RevisionService]
})
export class EntryComponent implements OnInit, OnDestroy, DoCheck {
  section: { id: number, title: string, short_help: string, items: any };
  item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  data: { sections: any };
  questions: any;
  measureToRemoveFromTags: string;
  subscription: Subscription;


  public revisions = null;
  public currentVersion: Date;

  constructor(private route: ActivatedRoute,
              private http: HttpClient,
              private _modalsService: ModalsService,
              private _appDataService: AppDataService,
              private _sidStatusService: SidStatusService,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _piaService: PiaService,
              private _actionPlanService: ActionPlanService,
              private _globalEvaluationService: GlobalEvaluationService,
              public _revisionService: RevisionService,
              private _measureService: MeasureService) { }

  async ngOnInit() {
    let sectionId = parseInt(this.route.snapshot.params.section_id, 10);
    let itemId = parseInt(this.route.snapshot.params.item_id, 10);

    await this._piaService.getPIA();
    if (this._piaService.pia.structure_data) {
      this._appDataService.dataNav = this._piaService.pia.structure_data;
    }
    this.data = this._appDataService.dataNav;

    this.route.params.subscribe(
      (params: Params) => {
        sectionId = parseInt(params.section_id, 10);
        itemId = parseInt(params.item_id, 10);
        this.getSectionAndItem(sectionId, itemId);
        window.scroll(0, 0);
      }
    );

    // Suscribe to measure service messages
    this.subscription = this._measureService.behaviorSubject.subscribe((val) => {
      this.measureToRemoveFromTags = val;
    });
  }

  ngDoCheck() {
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

      // For each of these questions, get their respective answer
      listQuestions.forEach(questionsSet => {
        questionsSet.forEach(q => {
          const answer = new Answer();
          answer.getByReferenceAndPia(this._piaService.pia.id, q.id).then(() => {
            if (answer.data && answer.data.list.length > 0 && answer.data.list.includes(measureName)) {
              const index = answer.data.list.indexOf(measureName);
              answer.data.list.splice(index, 1);
              answer.update();
            }
          });
        });
      });
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
   */
  private async getSectionAndItem(sectionId: number, itemId: number) {
    if (this._piaService.pia.structure_data) {
      this._appDataService.dataNav = this._piaService.pia.structure_data;
    }
    this.data = this._appDataService.dataNav;
    this.section = this.data.sections.filter((section) => {
      return section.id === sectionId;
    })[0];
    this.item = this.section.items.filter((item) => {
      return item.id === itemId;
    })[0];

    this._globalEvaluationService.section = this.section;
    this._globalEvaluationService.item = this.item;

    this.questions = [];
    if (this.item.questions) {
      this.item.questions.forEach(question => {
        this.questions.push(question);
      });
    }

    this._piaService.getPIA().then(() => {
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

      // Load PIA's revisions
      this._revisionService.getAll(this._piaService.pia.id)
      .then((resp) => {
        this.revisions = resp;
        this.currentVersion = this._piaService.pia.updated_at;
      });

    });

    // Update on knowledge base (scroll / content / search field)
    const knowledgeBaseScroll  = document.querySelector('.pia-knowledgeBaseBlock-list');
    const knowledgeBaseContent  = document.querySelector('.pia-knowledgeBaseBlock-searchForm input') as HTMLInputElement;
    knowledgeBaseScroll.scrollTop = 0;
    knowledgeBaseContent.value = '';

    this._knowledgeBaseService.q = null;
    this._knowledgeBaseService.loadByItem(this.item);
    this._knowledgeBaseService.placeholder = null;
  }

  /********** REVISIONS ACTIONS ***********/
    /**
     * Create a new Revision record in indexDB
     */
    onNewRevision() {
      this._piaService.export(this._piaService.pia.id)
        .then((exportResult) => {
          this._revisionService.add(exportResult, this._piaService.pia.id)
            .then((resp) => {
              // because ngOnchanges no detect simply array push
              this.revisions.push(resp);
              this.revisions = this.revisions.slice();
            });
        });
    }
  /********** END REVISIONS ACTIONS ***********/
}
