import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Pia } from '../pia.model';

import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { PiaService } from 'app/services/pia.service';
import { StructureService } from 'app/services/structure.service';
import { AnswerStructureService } from 'app/services/answer-structure.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss'],
  providers: [PiaService, StructureService]
})
export class KnowledgeBaseComponent implements OnInit {
  searchForm: FormGroup;
  @Input() item: any;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _measureService: MeasureService,
              public _knowledgeBaseService: KnowledgeBaseService,
              private el: ElementRef,
              private _translateService: TranslateService,
              private _piaService: PiaService,
              private _answerStructureService: AnswerStructureService,
              private _structureService: StructureService) { }

  ngOnInit() {
    this._piaService.getPIA();
    this.searchForm = new FormGroup({
      q: new FormControl()
    });
    window.onscroll = function(ev) {
      if (window.innerWidth > 640) {
        const el: any = document.querySelector('.pia-knowledgeBaseBlock');
        const el2 = document.querySelector('.pia-knowledgeBaseBlock-list');
        if (el && el2) {
          el2.setAttribute('style', 'height:' + (window.innerHeight - 350) + 'px');
          if (window.scrollY >= 100) {
            el.setAttribute('style', 'width:283px;');
            el.classList.add('pia-knowledgeBaseBlock-scroll');
          } else {
            el.setAttribute('style', 'width:auto;');
            el.classList.remove('pia-knowledgeBaseBlock-scroll');
          }
        }
      }
    };
  }

  /**
   * New knowledge base search query.
   * @memberof KnowledgeBaseComponent
   */
  onSubmit() {
    this._knowledgeBaseService.translateService = this._translateService;
    this._knowledgeBaseService.q = this.searchForm.value.q;
    const filterBlock = this.el.nativeElement.querySelector('.pia-knowledgeBaseBlock-filters');
    if (filterBlock) {
      filterBlock.querySelector('button').click();
    }
    this._knowledgeBaseService.search();
  }

  /**
   * Allows an user to add a new measure (with its title and its placeholder) through the knowledge base.
   * @param {Event} event - Any kind of event.
   * @memberof KnowledgeBaseComponent
   */
  addNewMeasure(event) {
    if (this._piaService.pia.id > 0) {
      this._measureService.addNewMeasure(this._piaService.pia, event.name, event.placeholder);
    } else if (this._structureService.structure.id > 0) {
      this._structureService.getStructure().then(() => {
        const title = this._translateService.instant(event.name);
        const measure = {
          'title': title,
          'content': ''
        }
        this._structureService.structure.data.sections.filter(s => s.id === 3)[0].items.filter(i => i.id === 1)[0].answers.push(measure);
        this._structureService.structure.update().then(() => {
          this.item.answers.push(measure);
        });
      });
    }
  }

}
