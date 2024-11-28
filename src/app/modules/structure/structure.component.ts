import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Structure } from 'src/app/models/structure.model';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { MeasureService } from 'src/app/services/measures.service';
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
    private actionPlanService: ActionPlanService,
    private globalEvaluationService: GlobalEvaluationService,
    private measureService: MeasureService,
    private appDataService: AppDataService,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe({
      complete: () => {
        this.appDataService.entrieMode = 'structure';

        const sectionId = parseInt(this.route.snapshot.params.section_id, 10);
        const itemId = parseInt(this.route.snapshot.params.item_id, 10);

        if (parseInt(this.route.snapshot.params.id)) {
          this.structureService
            .find(parseInt(this.route.snapshot.params.id))
            .then((structure: Structure) => {
              this.initStructure(structure);
              this.getSectionAndItem(sectionId, itemId);
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          this.structureService.loadExample().then((structure: Structure) => {
            this.initStructure(structure);
            this.getSectionAndItem(sectionId, itemId);
          });
        }

        // Subscribe to measure service messages
        this.subscription = this.measureService.behaviorSubject.subscribe(
          val => {
            this.measureToRemoveFromTags = val;
          }
        );
      }
    });
  }

  async ngOnInit(): Promise<void> {}

  initStructure(structure): void {
    this.structure = structure;
    this.data = structure.data;

    // define section
    this.data.sections.forEach(section => {
      section.items.forEach(item => {
        this.sidStatusService.setStructureStatus(section, item);
      });
    });

    // On params changing
    this.route.params.subscribe((params: Params) => {
      this.getSectionAndItem(
        parseInt(params.section_id, 10),
        parseInt(params.item_id, 10)
      );
      window.scroll(0, 0);
    });
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
  }
}
