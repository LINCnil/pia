import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Http } from '@angular/http';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ActionPlanService } from 'app/entry/entry-content/action-plan//action-plan.service';
import { PiaService } from 'app/entry/pia.service';
import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  providers: [PiaService]
})
export class EntryComponent implements OnInit {

  measureTitle: string;
  measurePlaceholder: string;
  section: { id: number, title: string, short_help: string, items: any };
  item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  data: { sections: any };
  questions: any;
  sidStatus: any;

  constructor(private route: ActivatedRoute,
              private http: Http,
              private _modalsService: ModalsService,
              private _evaluationService: EvaluationService,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _piaService: PiaService,
              private _actionPlanService: ActionPlanService,
              private _measureService: MeasureService) {
    let sectionId = parseInt(this.route.snapshot.params['section_id'], 10);
    let itemId = parseInt(this.route.snapshot.params['item_id'], 10);

    this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
      this.data = data;
      this.getSectionAndItem(sectionId, itemId);
      this.route.params.subscribe(
        (params: Params) => {
          sectionId = parseInt(params['section_id'], 10);
          itemId = parseInt(params['item_id'], 10);
          this.getSectionAndItem(sectionId, itemId);
        }
      );
    });
  }

  ngOnInit() { }

  addNewMeasure(item) {
    this.measureTitle = item.name;
    if (item.placeholder !== undefined) {
      this.measurePlaceholder = item.placeholder;
    } else {
      this.measurePlaceholder = 'Ajoutez les mesures prises pour garantir la sécurité des données.';
    }
  }

  private getSectionAndItem(sectionId, itemId) {
    this.section = this.data['sections'].filter((section) => {
      return section.id === sectionId;
    })[0];
    this.item = this.section['items'].filter((item) => {
      return item.id === itemId;
    })[0];

    // Set elements for evaluation verification on each page.
    this._evaluationService.section = this.section;
    this._evaluationService.item = this.item;

    this.questions = [];
    if (this.item['questions']) {
      this.item['questions'].forEach(question => {
        this.questions.push(question);
      });
    }

    this._piaService.getPIA().then(() => {
      this._measureService.listMeasures(this._piaService.pia.id).then(() => {
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
      });
      this._piaService.setSidStatus().then(() => {
        this.sidStatus = this._piaService.sidStatus;
      });

      this._actionPlanService.data = this.data;
      this._actionPlanService.pia = this._piaService.pia;
    });

    // Update on knowledge base (scroll / content / search field)
    const knowledgeBaseScroll  = document.querySelector('.pia-knowledgeBaseBlock-list');
    const knowledgeBaseContent  = <HTMLInputElement>document.querySelector('.pia-knowledgeBaseBlock-searchForm input');
    knowledgeBaseScroll.scrollTop = 0;
    knowledgeBaseContent.value = '';

    this._knowledgeBaseService.q = null;
    this._knowledgeBaseService.loadByItem(this.item);
  }
}
