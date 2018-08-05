import { Component, OnInit } from '@angular/core';
import { Angular2CsvComponent } from 'angular2-csv';

@Component({
  selector: 'angular6csv',
  template: `<a (click)="onDownload()">
      <i class="fa fa-2x fa-file-excel-o"></i>
    </a>`
})
export class CsvComponent extends Angular2CsvComponent implements OnInit {
  constructor() {
    super();
  }
}
/**
 * Option Interface
 */
export interface Options {
  filename: string;
  fieldSeparator: string;
  quoteStrings: string;
  decimalseparator: string;
  showLabels: boolean;
  showTitle: boolean;
  title: string;
  useBom: boolean;
  headers: string[];
  keys: string[];
  removeNewLines: boolean;
}
