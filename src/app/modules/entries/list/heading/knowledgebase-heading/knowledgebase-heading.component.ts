import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-knowledgebase-heading]',
  templateUrl: './knowledgebase-heading.component.html',
  styleUrls: ['./knowledgebase-heading.component.scss']
})
export class KnowledgebaseHeadingComponent implements OnInit {
  sortOrder: string;
  sortValue: string;
  @Output() sorting = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Click on sort by attribute
   * @param fieldToSort
   */
  sortBy(fieldToSort: string): void {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sorting.emit(fieldToSort);
  }


}
