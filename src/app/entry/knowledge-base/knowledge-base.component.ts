import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'

import { Pia } from '../pia.model';

import { MeasureService } from 'app/entry/entry-content/measures/measures.service';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss']
})
export class KnowledgeBaseComponent implements OnInit {

  data: any;
  searchForm: FormGroup;
  @Input() pia: Pia;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: Http, private _measureService: MeasureService) { }

  ngOnInit() {
    const kb = this.http.request('/assets/files/pia_knowledge-base.json').map(res => res.json()).subscribe(data => {
      this.data = data;
    });
    this.searchForm = new FormGroup({
      q: new FormControl()
    });
  }

  // TODO - Error ExpressionChangedAfterItHasBeenCheckedError
  getEntryContentHeight() {
    // Automatic resize the height of the KnowledgeBase block to improve the navigation with the overflow.
    // let totalSize = 0;
    // const centralElementHeight = <HTMLElement>document.querySelector('.pia-entryContentBlock');
    // if (centralElementHeight) {
    //   const element = <HTMLElement>document.querySelector('.pia-knowledgeBaseBlock-list');
    //   totalSize = centralElementHeight.offsetHeight - 190;
    // }
    // return (totalSize < 700 ? 700 : totalSize) + 'px';
  }

  onSubmit() {
    const q = this.searchForm.value.q;
    const items: any = document.querySelectorAll('app-knowledge-base-item');
    items.forEach((element) => {
      if (q !== '') {
        element.classList.add('hide');
      } else {
        element.classList.remove('hide');
      }
    });
  }

  /**
   * Allows an user to add a new measure (with its title and its placeholder) through the knowledge base.
   * @param {Event} event any kind of event.
   */
  addNewMeasure(event) {
    this._measureService.addNewMeasure(this.pia, event.name, event.placeholder);
  }

}
