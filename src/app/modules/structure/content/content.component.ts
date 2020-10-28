import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { MeasureService } from 'src/app/services/measures.service';
import { PaginationService } from 'src/app/services/pagination.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  @Input() structure: any;
  @Input() section: any;
  @Input() item: any;
  @Input() questions: any;
  @Input() data: any;
  // subscriptionMeasure: Subscription;
  subscriptionQuestion: Subscription;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              public measureService: MeasureService,
              public structureService: StructureService,
              public sidStatusService: SidStatusService,
              public paginationService: PaginationService,
              private answerStructureService: AnswerStructureService,
              private knowledgeBaseService: KnowledgeBaseService) { }

  ngOnInit() {
    // Reset measures no longer addable from KB when switching Structure
    this.knowledgeBaseService.toHide = [];

    // Update the last edited date for this Structure
    this.structure.updated_at = new Date();
    this.structureService.update(this.structure);

    /*this.subscriptionMeasure = this.answerStructureService.measureToRemove.subscribe((index) => {
      this.item.answers.splice(index, 1);
      }
    );*/

    this.subscriptionQuestion = this.answerStructureService.questionToRemove.subscribe((index) => {
      this.questions.splice(index, 1);
      }
    );
  }

  async ngOnChanges() {
    this.paginationService.dataNav = this.structure.data;

    const sectionId = parseInt(this.activatedRoute.snapshot.params.section_id, 10);
    const itemId = parseInt(this.activatedRoute.snapshot.params.item_id, 10);

    this.paginationService.setPagination(sectionId, itemId);
  }

  /**
   * Add new question.
   */
  async addQuestion() {
      this.answerStructureService.addQuestion(this.structure, this.section, this.item).then((question: any) => {
        this.questions.push(question);
      });
  }

  /**
   * Add new measure.
   */
  async addMeasure() {
    this.answerStructureService.addMeasure(this.structure, this.section, this.item).then((measure: any) => {
      this.item.answers.push(measure);
    });
  }

  /**
   * Go to next item.
   * @private
   * @param {number} status_start - From status.
   * @param {number} status_end - To status.
   */
  private goToNextSectionItem(status_start: number, status_end: number) {
    const goto_section_item = this.paginationService.getNextSectionItem(status_start, status_end);

    this.router.navigate([
      'structures',
      this.structure.id,
      'section',
      goto_section_item[0],
      'item',
      goto_section_item[1]
    ]);
  }

  ngOnDestroy() {
    // this.subscriptionMeasure.unsubscribe();
    this.subscriptionQuestion.unsubscribe();
  }

}
