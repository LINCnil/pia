import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Structure } from 'src/app/models/structure.model';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { MeasureService } from 'src/app/services/measures.service';
import { ModalsService } from 'src/app/services/modals.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.scss']
})
export class StructureComponent implements OnInit {
  structure: Structure = null;
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
    public structureService: StructureService,
    private route: ActivatedRoute,
    private sidStatusService: SidStatusService,
    private knowledgeBaseService: KnowledgeBaseService,
    private answerStructureService: AnswerStructureService,
    private actionPlanService: ActionPlanService,
    private globalEvaluationService: GlobalEvaluationService,
    private measureService: MeasureService
  ) {}

  async ngOnInit(): Promise<void> {
    let sectionId = parseInt(this.route.snapshot.params.section_id, 10);
    let itemId = parseInt(this.route.snapshot.params.item_id, 10);

    await this.structureService.find(parseInt(this.route.snapshot.params.structure_id))
      .then((structure: Structure) => {

        this.structure = structure;
        this.data = structure.data;
        this.answerStructureService.structure = structure;

        // define section
        this.data.sections.forEach(section => {
          section.items.forEach(item => {
            this.sidStatusService.setStructureStatus(section, item);
          });
        });

        if (this.route.snapshot.params.section_id && this.route.snapshot.params.item_id) {
          sectionId = parseInt(this.route.snapshot.params.section_id, 10);
          itemId = parseInt(this.route.snapshot.params.item_id, 10);
          this.getSectionAndItem(sectionId, itemId);
        }


      })
      .catch((err) => {
        console.error(err);
      });

    // On params changing
    this.route.params.subscribe((params: Params) => {
      sectionId = parseInt(params.section_id, 10);
      itemId = parseInt(params.item_id, 10);
      this.getSectionAndItem(sectionId, itemId);
      window.scroll(0, 0);
    });

    // Suscribe to measure service messages
    this.subscription = this.measureService.behaviorSubject.subscribe(val => {
      this.measureToRemoveFromTags = val;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Get the current Section and Item and initialize others information.
   * @private
   * @param {number} sectionId - The section id.
   * @param {number} itemId - The item id.
   */
  private getSectionAndItem(sectionId: number, itemId: number): void {
    this.questions = [];
    this.data = this.structure.data;

    this.section = this.data.sections.filter(section => {
      return section.id === sectionId;
    })[0];

    this.item = this.section.items.filter(item => {
      return item.id === itemId;
    })[0];

    this.globalEvaluationService.section = this.section;
    this.globalEvaluationService.item = this.item;

    if (this.item.questions) {
      this.item.questions.forEach(question => {
        this.questions.push(question);
      });
    }

    this.measureService.listMeasures(this.structure.id);
    this.actionPlanService.data = this.data;

    // Update on knowledge base (scroll / content / search field)
    // const knowledgeBaseScroll = document.querySelector(
    //   '.pia-knowledgeBaseBlock-list'
    // );
    // const knowledgeBaseContent = document.querySelector(
    //   '.pia-knowledgeBaseBlock-searchForm input'
    // ) as HTMLInputElement;
    // knowledgeBaseScroll.scrollTop = 0;
    // knowledgeBaseContent.value = '';

    // this.knowledgeBaseService.q = null;
    // this.knowledgeBaseService.loadByItem(this.item);
    // this.knowledgeBaseService.placeholder = null;
  }
}
