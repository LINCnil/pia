import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons/faCaretUp';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-knowledgebase-heading]',
  templateUrl: './knowledgebase-heading.component.html',
  styleUrls: ['./knowledgebase-heading.component.scss'],
  standalone: false
})
export class KnowledgebaseHeadingComponent implements OnInit {
  sortOrder: string;
  sortValue: string;
  @Output() sorting = new EventEmitter<any>();

  protected readonly faCaretUp = faCaretUp;
  protected readonly faCaretDown = faCaretDown;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Click on sort by attribute
   */
  sortBy(fieldToSort: string): void {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sorting.emit(fieldToSort);
  }
}
