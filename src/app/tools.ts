import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { formatDate } from '@angular/common';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Pipe({ name: 'nl2br' })
export class Nl2brPipe implements PipeTransform  {
  constructor() {}
  transform(value) {
    return value.replace(/\n/g, '<br>');
  }
}

@Pipe({ name: 'formatTheDate' })
export class FormatTheDate implements PipeTransform {
  transform(value: any, locale: string) {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return formatDate(value, 'shortDate', locale);
    } else {
      return '';
    }
  }
}

@Pipe({ name: 'filterForUser' })
export class FilterForUser implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
      if (!items || !searchText) return items;
      searchText = searchText.toLowerCase();
          return items.filter((data) => this.matchValue(data,searchText));
  }
  matchValue(data, value) {
    return Object.keys(data).map((key) => {
      if (key === "created_at") {
        return false;
      }
      return new RegExp(value, 'gi').test(data[key]);
    }).some(result => result);
  }
}
