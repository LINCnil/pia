import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  knowledgeBaseForm: FormGroup;
  importKnowledgeBaseForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string };
  view: 'knowledges';
  searchText: string;
  paramsSubscribe: Subscription;

  constructor(private router: Router, private el: ElementRef, private route: ActivatedRoute) {}

  ngOnInit() {
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      localStorage.setItem('sortOrder', this.sortOrder);
      localStorage.setItem('sortValue', this.sortValue);
    }

    // this.refreshContent();
    this.knowledgeBaseForm = new FormGroup({
      name: new FormControl(),
      author: new FormControl(),
      contributors: new FormControl()
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
  }

  ngOnDestroy() {
    this.paramsSubscribe.unsubscribe();
  }

  onCleanSearch() {
    this.searchText = '';
  }

  /**
   * Display elements in list view.
   */
  viewOnList() {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['knowledges', 'list']);
    // this.refreshContent();
  }

  /**
   * Display elements in card view.
   */
  viewOnCard() {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['knowledges', 'card']);
    // this.refreshContent();
  }

  /**
   * Creates a new knowledges base
   */
  newStruct() {
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
   * Save the newly created knowledges base.
   * Sends to the path associated to this new structure.
   */
  onSubmit() {
    const kb = new KnowledgeBase();
    kb.name = this.knowledgeBaseForm.value.name;
    kb.author = this.knowledgeBaseForm.value.author;
    kb.contributors = this.knowledgeBaseForm.value.contributors;
    kb.save().then((result: KnowledgeBase) => this.router.navigate(['knowledge', 'entry', result.id, 'section', 1, 'item', 1]));
  }

  /**
   * Asort items created on bases.
   * @param {string} fieldToSort - Field to sort.
   */
  sortBy(fieldToSort: string) {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    // this.sortStructure();
    this.sortKnowledgeBase();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Define how to sort the list.
   * @private
   */
  private sortKnowledgeBase() {
    /* this._structureService.structures.sort((a, b) => {
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
    } */
  }
}
