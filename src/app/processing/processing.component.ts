import { Component, OnInit, Output, OnDestroy, DoCheck } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { ProcessingService } from './processing.service';
import { ModalsService } from '../modals/modals.service';
import { ProcessingArchitectureService } from '../services/processing-architecture.service';
import { SidStatusService } from '../services/sid-status.service';
import { ProcessingModel } from '@api/models';
import { ProcessingApi } from '@api/services';

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingComponent implements OnInit {
  sections: any;
  section: { id: number, title: string, short_help: string, items: any };
  item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };

  constructor(private route: ActivatedRoute,
    private _modalsService: ModalsService,
    private _processingArchitectureService: ProcessingArchitectureService,
    private _sidStatusService: SidStatusService,
    private knowledgeBaseService: KnowledgeBaseService,
    private _processingService: ProcessingService
  ) { }

  ngOnInit() {
    this.sections = this.route.snapshot.data.sections;
    this.getSectionFromRouteParams(this.route.snapshot.params);

    this.route.params.subscribe((newParams: Params) => {
      this.getSectionFromRouteParams(newParams);

      window.scroll(0, 0);
    });
  }

  /**
   * Gets form section and item from route params
   * @private
   * @param {Params} params
   * @memberof ProcessingComponent
   */
  private getSectionFromRouteParams(params: Params) {
    const sectionId = parseInt(this.route.snapshot.params['section_id'], 10) || 1;
    const itemId = parseInt(this.route.snapshot.params['item_id'], 10) || 1;

    this.section = this.sections.filter((section) => {
      return section.id === sectionId;
    })[0];

    // this.item = this.section.items.filter((item) => {
    //   return item.id === itemId;
    // })[0];

    // this.updateKnowledgeBase();
  }

  /**
   * Updates the knowledge base section
   * @private
   * @param {number} sectionId - The section id.
   * @param {number} itemId - The item id.
   * @memberof ProcessingComponent
   */
  private updateKnowledgeBase() {
    // Update on knowledge base (scroll / content / search field)
    const knowledgeBaseScroll = document.querySelector('.pia-knowledgeBaseBlock-list');
    const knowledgeBaseContent = <HTMLInputElement>document.querySelector('.pia-knowledgeBaseBlock-searchForm input');

    knowledgeBaseScroll.scrollTop = 0;
    knowledgeBaseContent.value = '';

    this.knowledgeBaseService.q = null;
    this.knowledgeBaseService.loadByItem(this.item);
    this.knowledgeBaseService.placeholder = null;
  }

}
