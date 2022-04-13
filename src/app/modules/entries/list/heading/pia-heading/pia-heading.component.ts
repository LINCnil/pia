import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-pia-heading]',
  templateUrl: './pia-heading.component.html',
  styleUrls: ['./pia-heading.component.scss']
})
export class PiaHeadingComponent implements OnInit {
  sortOrder: string;
  sortValue: string;
  @Output() sorting = new EventEmitter<any>();

  constructor(public authService: AuthService) {}

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
