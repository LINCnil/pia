import {
  Component,
  OnInit,
  ElementRef,
  OnDestroy,
  Input,
  Renderer2
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { Pia } from '../entry/pia.model';

import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/services/pia.service';
import { StructureService } from 'app/services/structure.service';
import { Structure } from 'app/structures/structure.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';

import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  providers: [PiaService, StructureService]
})
export class CardsComponent implements OnInit, OnDestroy {
  @Input() pia: any;
  newPia: Pia;
  piaForm: FormGroup;
  importPiaForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string };
  view: 'card';
  paramsSubscribe: Subscription;

  constructor(
    private router: Router,
    private el: ElementRef,
    private route: ActivatedRoute,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    public _structureService: StructureService
  ) {}

  ngOnInit() {
    const structure = new Structure();
    structure.getAll().then((data: any) => {
      this._structureService.structures = data;
    });

    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      localStorage.setItem('sortOrder', this.sortOrder);
      localStorage.setItem('sortValue', this.sortValue);
    }
    this.refreshContent();
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl(),
      structure: new FormControl([])
    });
    this.viewStyle = {
      view: this.route.snapshot.params['view']
    };
    this.paramsSubscribe = this.route.params.subscribe((params: Params) => {
      this.viewStyle.view = params['view'];
    });
    if (localStorage.getItem('homepageDisplayMode') === 'list') {
      this.viewOnList();
    } else {
      this.viewOnCard();
    }
    this.importPiaForm = new FormGroup({
      import_file: new FormControl('', [])
    });
  }

  ngOnDestroy() {
    this.paramsSubscribe.unsubscribe();
  }

  /**
   * Creates a new PIA card and adds a flip effect to go switch between new PIA and edit PIA events.
   * @memberof CardsComponent
   */
  newPIA() {
    this.newPia = new Pia();
    const cardsToSwitch = document.getElementById('cardsSwitch');
    cardsToSwitch.classList.toggle('flipped');
    const rocketToHide = document.getElementById('pia-rocket');
    if (rocketToHide) {
      rocketToHide.style.display = 'none';
    }
  }

  /**
   * Inverse the order of the list.
   * @memberof CardsComponent
   */
  reversePIA() {
    const cardsToSwitchReverse = document.getElementById('cardsSwitch');
    cardsToSwitchReverse.classList.remove('flipped');
  }

  /**
   * Import a new PIA.
   * @param {*} [event] - Any Event.
   * @memberof CardsComponent
   */
  importPia(event?: any) {
    if (event) {
      this._piaService.import(event.target.files[0]);
    } else {
      this.el.nativeElement.querySelector('#import_file').click();
    }
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   * @memberof CardsComponent
   */
  onSubmit() {
    const pia = new Pia();
    pia.name = this.piaForm.value.name;
    pia.author_name = this.piaForm.value.author_name;
    pia.evaluator_name = this.piaForm.value.evaluator_name;
    pia.validator_name = this.piaForm.value.validator_name;
    const structure_id = this.piaForm.value.structure;
    if (structure_id && structure_id > 0) {
      const structure = new Structure();
      structure.get(structure_id).then(() => {
        pia.structure_id = structure.id;
        pia.structure_name = structure.name;
        pia.structure_sector_name = structure.sector_name;
        pia.structure_data = this.removeEmptyElements(structure.data);
        pia.create().then(id => {
          this.structureCreateMeasures(pia, id).then(() => {
            this.structureCreateAnswers(pia, id).then(() =>
              this.router.navigate(['entry', id, 'section', 1, 'item', 1])
            );
          });
        });
      });
    } else {
      pia
        .create()
        .then(id =>
          this.router.navigate(['entry', id, 'section', 1, 'item', 1])
        );
    }
  }

  removeEmptyElements(structure_data) {
    structure_data.sections.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          if (item.is_measure) {
            if (item.answers && item.answers.length > 0) {
              let index = 0;
              item.answers.forEach(answer => {
                if (answer && answer.title.length <= 0) {
                  item.answers.splice(index, 1);
                }
                index++;
              });
            }
          } else if (item.questions) {
            item.questions.forEach(question => {
              if (
                question.answer &&
                question.answer.length > 0 &&
                question.answer.title &&
                question.answer.title.length <= 0
              ) {
                const index = item.questions.findIndex(
                  q => q.id === question.id
                );
                item.questions.splice(index, 1);
              }
            });
          }
        });
      }
    });
    return structure_data;
  }

  async structureCreateMeasures(pia: Pia, id: any) {
    return new Promise((resolve, reject) => {
      // Record the structures Measures
      const structures_measures = pia.structure_data.sections
        .filter(s => s.id === 3)[0]
        .items.filter(i => i.id === 1)[0].answers;
      let i = 0;
      if (structures_measures.length > 0) {
        for (const m in structures_measures) {
          if (structures_measures.hasOwnProperty(m) && structures_measures[m]) {
            const measure = new Measure();
            measure.pia_id = id;
            measure.title = structures_measures[m].title;
            measure.content = structures_measures[m].content;
            measure.create().then(() => {
              i++;
              if (i === structures_measures.length) {
                resolve();
              }
            });
          }
        }
      } else {
        resolve();
      }
    });
  }

  async structureCreateAnswers(pia: Pia, id: any) {
    // Record the structures Answers
    return new Promise((resolve, reject) => {
      const questions = [];
      pia.structure_data.sections.forEach(section => {
        if (section.items) {
          section.items.forEach(item => {
            if (item.questions) {
              item.questions.forEach(question => {
                if (question.answer && question.answer.length > 0) {
                  questions.push(question);
                }
              });
            }
          });
        }
      });

      if (questions.length > 0) {
        let i = 0;
        questions.forEach(question => {
          const answer = new Answer();
          answer.pia_id = id;
          answer.reference_to = question.id;
          answer.data = { text: question.answer, gauge: null, list: null };
          answer.create().then(() => {
            i++;
            if (i === questions.length) {
              resolve();
            }
          });
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Asort items created on PIA.
   * @param {string} fieldToSort - Field to sort.
   * @memberof CardsComponent
   */
  sortBy(fieldToSort: string) {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sortPia();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Display elements in list view.
   * @memberof CardsComponent
   */
  viewOnList() {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['home', 'list']);
    this.refreshContent();
  }

  /**
   * Display elements in card view.
   * @memberof CardsComponent
   */
  viewOnCard() {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['home', 'card']);
    this.refreshContent();
  }

  /**
   * Refresh the list.
   * @memberof CardsComponent
   */
  async refreshContent() {
    const pia = new Pia();
    const data: any = await pia.getAll();
    this._piaService.pias = data;
    this._piaService.calculProgress();
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    setTimeout(() => {
      this.sortPia();
    }, 200);
  }

  /**
   * Define how to sort the list.
   * @private
   * @memberof CardsComponent
   */
  private sortPia() {
    this._piaService.pias.sort((a, b) => {
      let firstValue = a[this.sortValue];
      let secondValue = b[this.sortValue];
      if (this.sortValue === 'updated_at' || this.sortValue === 'created_at') {
        firstValue = new Date(a[this.sortValue]);
        secondValue = new Date(b[this.sortValue]);
      }
      if (
        this.sortValue === 'name' ||
        this.sortValue === 'author_name' ||
        this.sortValue === 'evaluator_name' ||
        this.sortValue === 'validator_name'
      ) {
        return firstValue.localeCompare(secondValue);
      } else {
        if (firstValue < secondValue) {
          return -1;
        }
        if (firstValue > secondValue) {
          return 1;
        }
        return 0;
      }
    });
    if (this.sortOrder === 'up') {
      this._piaService.pias.reverse();
    }
  }
}
