import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";

import { KnowledgeBaseService } from "src/app/entry/knowledge-base/knowledge-base.service";
import { MeasureService } from "src/app/entry/entry-content/measures/measures.service";
import { ActionPlanService } from "src/app/entry/entry-content/action-plan//action-plan.service";
import { StructureService } from "src/app/services/structure.service";
import { AnswerStructureService } from "src/app/services/answer-structure.service";
import { ModalsService } from "src/app/modals/modals.service";
import { AppDataService } from "src/app/services/app-data.service";
import { SidStatusService } from "src/app/services/sid-status.service";
import { GlobalEvaluationService } from "src/app/services/global-evaluation.service";

@Component({
  selector: "app-entry",
  templateUrl: "./entry.component.html",
  styleUrls: ["./entry.component.scss"],
  providers: [StructureService]
})
export class EntryComponent implements OnInit, OnDestroy {
  section: { id: number; title: string; short_help: string; items: any };
  item: {
    id: number;
    title: string;
    evaluation_mode: string;
    short_help: string;
    questions: any;
  };
  data: { sections: any };
  questions: any;
  measureToRemoveFromTags: string;
  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private _modalsService: ModalsService,
    private _appDataService: AppDataService,
    private _sidStatusService: SidStatusService,
    private _knowledgeBaseService: KnowledgeBaseService,
    private _structureService: StructureService,
    private _answerStructureService: AnswerStructureService,
    private _actionPlanService: ActionPlanService,
    private _globalEvaluationService: GlobalEvaluationService,
    private _measureService: MeasureService
  ) {}

  async ngOnInit() {
    let sectionId = parseInt(this.route.snapshot.params.section_id, 10);
    let itemId = parseInt(this.route.snapshot.params.item_id, 10);

    await this._structureService.getStructure();
    this.data = this._structureService.structure.data;
    this._answerStructureService.structure = this._structureService.structure;

    this.data.sections.forEach(section => {
      section.items.forEach(item => {
        this._sidStatusService.setStructureStatus(section, item);
      });
    });

    this.route.params.subscribe((params: Params) => {
      sectionId = parseInt(params.section_id, 10);
      itemId = parseInt(params.item_id, 10);
      this.getSectionAndItem(sectionId, itemId);
      window.scroll(0, 0);
    });

    // Suscribe to measure service messages
    this.subscription = this._measureService.behaviorSubject.subscribe(val => {
      this.measureToRemoveFromTags = val;
    });
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
  private getSectionAndItem(sectionId: number, itemId: number) {
    this.questions = [];

    this._structureService.getStructure().then(() => {
      this.data = this._structureService.structure.data;
      this.section = this.data.sections.filter(section => {
        return section.id === sectionId;
      })[0];
      this.item = this.section.items.filter(item => {
        return item.id === itemId;
      })[0];

      this._globalEvaluationService.section = this.section;
      this._globalEvaluationService.item = this.item;

      if (this.item.questions) {
        this.item.questions.forEach(question => {
          this.questions.push(question);
        });
      }

      this._measureService.listMeasures(this._structureService.structure.id);
      this._actionPlanService.data = this.data;

      // Update on knowledge base (scroll / content / search field)
      const knowledgeBaseScroll = document.querySelector(
        ".pia-knowledgeBaseBlock-list"
      );
      const knowledgeBaseContent = document.querySelector(
        ".pia-knowledgeBaseBlock-searchForm input"
      ) as HTMLInputElement;
      knowledgeBaseScroll.scrollTop = 0;
      knowledgeBaseContent.value = "";

      this._knowledgeBaseService.q = null;
      this._knowledgeBaseService.loadByItem(this.item);
      this._knowledgeBaseService.placeholder = null;
    });
  }
}
