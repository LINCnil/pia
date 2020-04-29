import { Component, OnInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { Pia } from '../entry/pia.model';
import { Structure } from 'src/app/structures/structure.model';

import { TranslateService } from '@ngx-translate/core';
import { ModalsService } from 'src/app/modals/modals.service';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';
import { IntrojsService } from '../services/introjs.service';

import * as introJs from 'intro.js/intro.js';

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
  searchText: string;

  constructor(
    private router: Router,
    private el: ElementRef,
    private route: ActivatedRoute,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    public _structureService: StructureService,
    private _translateService: TranslateService,
    private _introjsService: IntrojsService
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
      category: new FormControl(),
      structure: new FormControl([])
    });
    this.viewStyle = {
      view: this.route.snapshot.params.view
    };
    this.paramsSubscribe = this.route.params.subscribe((params: Params) => {
      this.viewStyle.view = params.view;
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

  onCleanSearch() {
    this.searchText = '';
  }

  ngOnDestroy() {
    this.paramsSubscribe.unsubscribe();
  }

  ngAfterViewInit() {
    if (!localStorage.getItem('onboardingDashboardConfirmed')) {
      if (localStorage.getItem('homepageDisplayMode') === 'card') {
        this._introjsService.start('dashboard');
      }
    }
  }

  /**
   * On PIA change.
   * @param {any} pia - Any PIA.
   */
  piaChange(pia) {
    if (this._piaService.pias.includes(pia)) {
      this._piaService.pias.forEach(item => {
        if (item.id === pia.id) item = pia;
      });
    } else {
      this._piaService.pias.push(pia);
    }
  }

  /**
   * Creates a new PIA card and adds a flip effect to go switch between new PIA and edit PIA events.
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
   */
  reversePIA() {
    const cardsToSwitchReverse = document.getElementById('cardsSwitch');
    cardsToSwitchReverse.classList.remove('flipped');
  }

  /**
   * Import a new PIA.
   * @param {*} [event] - Any Event.
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
   */
  onSubmit() {
    this._piaService.saveNewPia(this.piaForm).then((id: number) => {
      this.router.navigate(['entry', id, 'section', 1, 'item', 1]);
    });
  }

  /**
   * Asort items created on PIA.
   * @param {string} fieldToSort - Field to sort.
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
   */
  viewOnList() {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['home', 'list']);
    this.refreshContent();
  }

  /**
   * Display elements in card view.
   */
  viewOnCard() {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    // this.router.navigate(['home', 'card']);
    this.refreshContent();
  }

  /**
   * Refresh the list.
   */
  async refreshContent() {
    const pia = new Pia();
    setTimeout(async () => {
      await pia.getAllActives().then((data: Array<Pia>) => {
        this._piaService.pias = data;
        this._piaService.calculProgress();
        this.sortOrder = localStorage.getItem('sortOrder');
        this.sortValue = localStorage.getItem('sortValue');
        this.sortPia();
      });
    }, 200);
  }

  /**
   * Define how to sort the list.
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
