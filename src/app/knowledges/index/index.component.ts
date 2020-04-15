import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  structureForm: FormGroup;
  importStructureForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string };
  view: 'structure';
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
    this.structureForm = new FormGroup({
      name: new FormControl(),
      sector_name: new FormControl()
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
}
