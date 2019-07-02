import { Component, OnInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { StructureService } from 'src/app/services/structure.service';
import { Structure } from './structure.model';
import { ModalsService } from 'src/app/modals/modals.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'app-structures',
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.scss'],
  providers: [StructureService]
})

export class StructuresComponent implements OnInit, OnDestroy {
  @Input() structure: any;
  newStructure: Structure;
  structureForm: FormGroup;
  importStructureForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string }
  view: 'structure';
  paramsSubscribe: Subscription;
  structExampleSubscribe: Subscription;

  constructor(private router: Router,
              private el: ElementRef,
              private route: ActivatedRoute,
              public _modalsService: ModalsService,
              private _appDataService: AppDataService,
              public _structureService: StructureService,
              public _languagesService: LanguagesService,
              private _translateService: TranslateService) { }

  ngOnInit() {
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      localStorage.setItem('sortOrder', this.sortOrder);
      localStorage.setItem('sortValue', this.sortValue);
    }
    this.refreshContent();
    this.structureForm = new FormGroup({
      name: new FormControl(),
      sector_name: new FormControl()
    });
    this.viewStyle = {
      view: this.route.snapshot.params.view
    };
    this.paramsSubscribe = this.route.params.subscribe(
      (params: Params) => {
        this.viewStyle.view = params.view;
      }
    );
    if (localStorage.getItem('homepageDisplayMode') === 'list') {
      this.viewOnList();
    } else {
      this.viewOnCard();
    }
    this.importStructureForm = new FormGroup({
      import_file: new FormControl('', [])
    });

    this.structExampleSubscribe = this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.refreshContent();
    });
  }

  ngOnDestroy() {
    this.paramsSubscribe.unsubscribe();
    this.structExampleSubscribe.unsubscribe();
  }

  /**
   * On structure change.
   * @param {any} structure - Any Structure.
   */
  structChange(structure) {
    this._structureService.structures.push(structure);
  }

  /**
   * Creates a new PIA card and adds a flip effect to go switch between new PIA and edit PIA events.
   */
  newStruct() {
    this.newStructure = new Structure();
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
  reverseStruct() {
    const cardsToSwitchReverse = document.getElementById('cardsSwitch');
    cardsToSwitchReverse.classList.remove('flipped');
  }

  /**
   * Import a new structure.
   * @param {*} [event] - Any Event.
   */
  importStruct(event?: any) {
    if (event) {
      this._structureService.importStructure(event.target.files[0]);
    } else {
      this.el.nativeElement.querySelector('#import_file').click();
    }
  }

  /**
   * Save the newly created structure.
   * Sends to the path associated to this new structure.
   */
  onSubmit() {
    const structure = new Structure();
    structure.name = this.structureForm.value.name;
    structure.sector_name = this.structureForm.value.sector_name;
    structure.data = this._appDataService.dataNav;
    const p = structure.create();
    p.then((id) => this.router.navigate(['structures', 'entry', id, 'section', 1, 'item', 1]));
  }

  /**
   * Asort items created on structure.
   * @param {string} fieldToSort - Field to sort.
   */
  sortBy(fieldToSort: string) {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sortStructure();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Display elements in list view.
   */
  viewOnList() {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['structures', 'list']);
    this.refreshContent();
  }

  /**
   * Display elements in card view.
   */
  viewOnCard() {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['structures', 'card']);
    this.refreshContent();
  }

  /**
   * Refresh the list.
   */
  async refreshContent() {
    const structure = new Structure();
    const data: any = await structure.getAll();

    this._structureService.loadExample().then((structureExample: Structure) => {
      data.push(structureExample);
    });

    this._structureService.structures = data;
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    setTimeout(() => {
      this.sortStructure();
    }, 200);
  }

  /**
   * Define how to sort the list.
   * @private
   */
  private sortStructure() {
    this._structureService.structures.sort((a, b) => {
      let firstValue = a[this.sortValue];
      let secondValue = b[this.sortValue];
      if (this.sortValue === 'updated_at' || this.sortValue === 'created_at') {
        firstValue = new Date(a[this.sortValue]);
        secondValue = new Date(b[this.sortValue]);
      }
      if (this.sortValue === 'name' || this.sortValue === 'sector_name') {
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
      this._structureService.structures.reverse();
    }
  }
}
