import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { Pia } from 'src/app/models/pia.model';
import { Structure } from 'src/app/models/structure.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { MeasureService } from 'src/app/services/measures.service';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss']
})
export class KnowledgeBaseComponent implements OnInit, OnChanges, OnDestroy {
  searchForm: UntypedFormGroup;
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
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
  ) {
    // Parse default Knowledge base json
    const defaultKnowledgeBase = new KnowledgeBase(
      0,
      this.translateService.instant('knowledge_base.default_knowledge_base'),
      'CNIL',
      'CNIL'
    );
    defaultKnowledgeBase.is_example = true;
    this.customKnowledgeBases.push(defaultKnowledgeBase);
  }

  ngOnInit(): void {
    // INIT
    const knowledgeIdentifier = this.pia
      ? 'pia_' + this.route.snapshot.params.id + '_knowledgebase'
      : null;
    this.selectedKnowledBase = localStorage.getItem(knowledgeIdentifier)
      ? localStorage.getItem(knowledgeIdentifier)
      : 0;

    this.searchForm = new UntypedFormGroup({
      q: new UntypedFormControl()
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
      if (this.selectedKnowledBase !== null) {
        this.switch(this.selectedKnowledBase);
      }
    });

    this.translateService.onLangChange.subscribe(() => {
      this.loadKnowledgesBase().then(() => {
        if (this.selectedKnowledBase !== null) {
          this.switch(this.selectedKnowledBase);
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item && changes.item.currentValue) {
      this.knowledgeBaseService.loadByItem(this.item);
    }
  }

  ngOnDestroy(): void {
    this.knowledgeBaseService.knowledgeBaseData = [];
    this.knowledgeBaseService.allKnowledgeBaseData = [];
    this.knowledgeBaseService.previousKnowledgeBaseData = [];
  }

  /**
   * Load the knowledges List
   */
  loadKnowledgesBase(): Promise<any> {
    return new Promise((resolve, reject) => {
      // LOAD CUSTOM KNOWLEDGE BASE
      this.knowledgeBaseService
        .getAll()
        .then((result: any) => {
          if (result) {
            this.customKnowledgeBases = [
              ...this.customKnowledgeBases,
              ...result
            ];
          }
          resolve(this.customKnowledgeBases);
        })
        .catch(() => {
          reject();
        });
    });
  }

  /**
   * New knowledge base search query.
   */
  onSubmit(): void {
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
   * @param event - Any kind of event.
   */
  addNewMeasure(event): void {
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

  switch(selectedKnowledBase): void {
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
