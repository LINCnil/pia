import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { Pia } from 'src/app/models/pia.model';
import { Structure } from 'src/app/models/structure.model';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { MeasureService } from 'src/app/services/measures.service';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss']
})
export class KnowledgeBaseComponent implements OnInit {
  searchForm: FormGroup;
  noTitle = false;
  @Input() item: any;
  @Input() structure: Structure;
  @Input() pia: Pia;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();
  customKnowledgeBases: KnowledgeBase[] = [];
  selectedKnowledBase: any = 0;

  constructor(
    private route: ActivatedRoute,
    private measureService: MeasureService,
    public knowledgeBaseService: KnowledgeBaseService,
    private el: ElementRef,
    private translateService: TranslateService,
    private structureService: StructureService
  ) {}

  ngOnInit() {
    this.searchForm = new FormGroup({
      q: new FormControl()
    });

    window.onscroll = ev => {
      if (window.innerWidth > 640) {
        const el: any = document.querySelector('.pia-knowledgeBaseBlock');
        const el2 = document.querySelector('.pia-knowledgeBaseBlock-list');
        if (el && el2) {
          el2.setAttribute(
            'style',
            'height:' + (window.innerHeight - 350) + 'px'
          );
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

    this.loadKnowledgesBase().then(() => {
      if (
        localStorage.getItem(
          'pia_' + this.route.snapshot.params.id + '_knowledgebase'
        )
      ) {
        this.selectedKnowledBase = localStorage.getItem(
          'pia_' + this.route.snapshot.params.id + '_knowledgebase'
        );
        this.switch(
          localStorage.getItem(
            'pia_' + this.route.snapshot.params.id + '_knowledgebase'
          )
        );
      }
    });

    this.translateService.onLangChange.subscribe(() => {
      this.loadKnowledgesBase().then(() => {
        if (
          localStorage.getItem(
            'pia_' + this.route.snapshot.params.id + '_knowledgebase'
          )
        ) {
          this.switch(
            localStorage.getItem(
              'pia_' + this.route.snapshot.params.id + '_knowledgebase'
            )
          );

          this.selectedKnowledBase = localStorage.getItem(
            'pia_' + this.route.snapshot.params.id + '_knowledgebase'
          );
        }
      });
    });
  }

  loadKnowledgesBase(): Promise<any> {
    this.customKnowledgeBases = [];
    return new Promise((resolve, reject) => {
      // LOAD CUSTOM KNOWLEDGE BASE
      this.knowledgeBaseService
        .getAll()
        .then((result: any) => {
          this.customKnowledgeBases = result;
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  /**
   * New knowledge base search query.
   */
  onSubmit() {
    this.knowledgeBaseService.translateService = this.translateService;
    this.knowledgeBaseService.q = this.searchForm.value.q;
    const filterBlock = this.el.nativeElement.querySelector(
      '.pia-knowledgeBaseBlock-filters'
    );
    if (filterBlock) {
      filterBlock.querySelector('button').click();
    }
    this.knowledgeBaseService.search();
  }

  /**
   * Allows an user to add a new measure (with its title and its placeholder) through the knowledge base.
   * @param {Event} event - Any kind of event.
   */
  addNewMeasure(event) {
    if (this.pia) {
      this.measureService
        .addNewMeasure(this.pia, event.name, event.placeholder)
        .then(res => {
          this.newMeasureEvent.emit(res);
        })
        .catch(err => {
          console.log(err);
        });
    } else if (this.structure) {
      this.structureService.find(this.structure.id).then(() => {
        const title = this.translateService.instant(event.name);
        const measure = {
          title,
          content: ''
        };
        this.structure.data.sections
          .filter(s => s.id === 3)[0]
          .items.filter(i => i.id === 1)[0]
          .answers.push(measure);
        this.structureService.update(this.structure).then(() => {
          this.item.answers.push(measure);
        });
      });
    }
  }

  switch(selectedKnowledBase) {
    this.knowledgeBaseService
      .switch(selectedKnowledBase)
      .then(() => {
        this.knowledgeBaseService.loadByItem(this.item);
        // SET LOCALSTORAGE
        localStorage.setItem(
          'pia_' + this.route.snapshot.params.id + '_knowledgebase',
          selectedKnowledBase
        );
      })
      .catch(err => {
        console.log(err);
      });
  }
}
