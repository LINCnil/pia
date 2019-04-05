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
