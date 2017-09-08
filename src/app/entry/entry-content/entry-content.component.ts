import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss'],
  providers: [PiaService]
})

export class EntryContentComponent implements OnInit, OnChanges {
  @Input() measureName: string;
  @Input() measurePlaceholder: string;
  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() questions: any;
  @Input() data: any;
  hasPreviousLink: boolean;
  hasNextLink: boolean;
  previousLink: any[] = []; // sectionId, itemId, itemTitle
  nextLink: any[] = []; // sectionId, itemId, itemTitle
  sectionId;
  itemId;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private _measureService: MeasureService,
              private _modalsService: ModalsService,
              private _piaService: PiaService,
              private _evaluationService: EvaluationService) {
  }

  ngOnInit() {
    this._piaService.getPIA().then((entry) => {
      this._piaService.pia.updated_at = new Date();
      this._piaService.pia.update();
    });
  }

  ngOnChanges() {
    this._piaService.getPIA().then((entry) => {
      this._evaluationService.setPia(this._piaService.pia);
      this._evaluationService.allowEvaluation();
      if (this.measureName) {
        this._measureService.addNewMeasure(this._piaService.pia, this.measureName, this.measurePlaceholder);
      }
      this.sectionId = parseInt(this.activatedRoute.snapshot.params['section_id'], 10);
      this.itemId = parseInt(this.activatedRoute.snapshot.params['item_id'], 10);
      this.checkForPreviousLink();
      this.checkForNextLink();
    });
  }

  /**
   * Allows an user to validate evaluation for a section.
   */
  validateEvaluation() {
    this._evaluationService.validateAllEvaluation().then((valid: boolean) => {
      if (valid) {
        this._modalsService.openModal('validate-evaluation');
      } else {
        this._modalsService.openModal('validate-evaluation-to-correct');
      }
    });
  }

  checkForPreviousLink() {
    if (this.sectionId === 1 && this.itemId === 1) { // 1.1
      this.hasPreviousLink = false;
    } else { // All others
      this.hasPreviousLink = true;
      this.previousLink = [];
      if (this.sectionId === 1) { // 1.2
        this.previousLink.push(this.sectionId);
        this.previousLink.push(this.itemId - 1);
        this.previousLink.push(this.data['sections'][this.sectionId - 1]['items'][this.itemId - 2].title);
      } else { // 2.x, 3.x, 4.x
        if (this.itemId !== 1) {  // 2.2, 3.2, 3.3, 3.4, 4.2, ...
          this.previousLink.push(this.sectionId); // Same section id
          this.previousLink.push(this.itemId - 1);  // Prev item id
          this.previousLink.push(this.data['sections'][this.sectionId - 1]['items'][this.itemId - 2].title); // Prev item title
        } else {  // 2.1, 3.1, 4.1
          this.previousLink.push(this.sectionId - 1); // Prev section id
          const previousSectionLength = this.data['sections'][this.sectionId - 2]['items'].length;
          const lastPreviousItem = this.data['sections'][this.sectionId - 2]['items'][previousSectionLength - 1];
          this.previousLink.push(lastPreviousItem.id);  // Prev item id (which is the last item of the previous section)
          this.previousLink.push(lastPreviousItem.title); // Prev item title
        }
      }
    }
  }

  checkForNextLink() {
    if (this.sectionId === 4 && this.itemId === 3) { // 4.3
      this.hasNextLink = false;
    } else { // All others
      this.hasNextLink = true;
      this.nextLink = [];
      const currentSectionLength = this.data['sections'][this.sectionId - 1]['items'].length;
      const currentSectionLastItemId = this.data['sections'][this.sectionId - 1]['items'][currentSectionLength - 1].id;
      if (this.itemId !== currentSectionLastItemId) { // Not the last item from the current section
        this.nextLink.push(this.sectionId); // Same section id
        this.nextLink.push(this.itemId + 1);  // Next item id
        this.nextLink.push(this.data['sections'][this.sectionId - 1]['items'][this.itemId].title);  // Next item title
      } else {  // last item from the current section
        this.nextLink.push(this.sectionId + 1); // Next section id
        const firstNextItem = this.data['sections'][this.sectionId]['items'][0];
        this.nextLink.push(firstNextItem.id);  // Next item id (which is the first item of the next section)
        this.nextLink.push(firstNextItem.title); // Next item title
      }
    }
  }

}
