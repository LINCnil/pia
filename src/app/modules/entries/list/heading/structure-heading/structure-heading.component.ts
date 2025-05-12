import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-structure-heading]',
  templateUrl: './structure-heading.component.html',
  styleUrls: ['./structure-heading.component.scss'],
  standalone: false
})
export class StructureHeadingComponent implements OnInit {
  sortOrder: string;
  sortValue: string;
  @Output() sorting = new EventEmitter<any>();

  protected readonly faCaretDown = faCaretDown;
  protected readonly faCaretUp = faCaretUp;

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
