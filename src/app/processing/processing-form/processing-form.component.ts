import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import 'rxjs/add/operator/map'

import { ProcessingArchitectureService } from '../../services/processing-architecture.service';
import { ModalsService } from '../../modals/modals.service';
import { PaginationService } from 'app/processing/processing-form/pagination.service';
import { TranslateService } from '@ngx-translate/core';
import { SidStatusService } from '../../services/sid-status.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { ProcessingService } from '../processing.service';
import { ProcessingModel } from '@api/models';

@Component({
  selector: 'app-processing-form',
  templateUrl: './processing-form.component.html',
  styleUrls: ['./processing-form.component.scss']
})

export class ProcessingFormComponent implements OnInit, OnChanges {
  @Input() section: any;
  @Input() item: any;
  @Input() data: any;
  @Input() sections: any;
  processing: ProcessingModel = new ProcessingModel();

  constructor(private _router: Router,
              private _processingArchitectureService: ProcessingArchitectureService,
              private _activatedRoute: ActivatedRoute,
              private _modalsService: ModalsService,
              public _processingService: ProcessingService,
              public _sidStatusService: SidStatusService,
              public _paginationService: PaginationService,
              private _translateService: TranslateService,
              private _knowledgeBaseService: KnowledgeBaseService) { }

  ngOnInit() {
    this._knowledgeBaseService.toHide = [];
  }

  ngOnChanges() {
    const sectionId = parseInt(this._activatedRoute.snapshot.params['section_id'], 10);
    const itemId = parseInt(this._activatedRoute.snapshot.params['item_id'], 10);

    this._paginationService.setPagination(sectionId, itemId);
  }


  /**
   * Go to next item.
   * @private
   * @param {number} status_start - From status.
   * @param {number} status_end - To status.
   * @memberof EntryContentComponent
   */
  private goToNextSectionItem(status_start: number, status_end: number) {
    const goto_section_item = this._paginationService.getNextSectionItem(status_start, status_end)

    this._router.navigate([
      'entry',
      this._processingService.processing.id,
      'section',
      goto_section_item[0],
      'item',
      goto_section_item[1]
    ]);
  }
}
