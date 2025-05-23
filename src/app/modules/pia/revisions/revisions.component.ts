import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { Subscription } from 'rxjs';

import { RevisionService } from 'src/app/services/revision.service';
import { Revision } from 'src/app/models/revision.model';
import { DatePipe } from '@angular/common';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';
import { RelativeDate } from './RelativeDate.class';
import { Pia } from 'src/app/models/pia.model';
import {
  faHistory,
  faCircle,
  faCircleCheck,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

function slugify(data): string {
  const a =
    'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;';
  const b =
    'aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return data
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

@Component({
  selector: 'app-revisions',
  templateUrl: './revisions.component.html',
  styleUrls: ['./revisions.component.scss'],
  providers: [RevisionService, TranslateService],
  standalone: false
})
export class RevisionsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() pia: Pia;
  @Input() currentVersion: Date;
  @Input() title = true;
  @Input() editMode: 'local' | 'author' | 'evaluator' | 'validator' | 'guest' =
    'local';
  revisions: Array<any>;
  subscription: Subscription;
  public opened = false;
  public revisionsGroupByMonth: any = {};
  public revisionsGroupByMonthInArray = [];
  public objectKeys = Object.entries;
  public activeRevision: any = null;

  public preview = null;

  protected readonly faHistory = faHistory;
  protected readonly faCircle = faCircle;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronUp = faChevronUp;
  protected readonly faCircleCheck = faCircleCheck;

  constructor(
    private translateService: TranslateService,
    public languagesService: LanguagesService,
    public revisionService: RevisionService
  ) {}

  ngOnInit(): void {
    // Load PIA's revisions
    this.revisionService.findAllByPia(this.pia.id).then((resp: any) => {
      this.revisions = resp;
      this.parsingDate();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update RevisionGroupByMonth on this.revisions changements
    this.generateDates(changes);
    this.subscription = this.translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.generateDates(changes);
      }
    );
  }

  generateDates(changes): void {
    if (changes.revisions && changes.revisions.currentValue) {
      this.parsingDate();
    }
  }

  parsingDate(): void {
    this.revisionsGroupByMonth = {};
    this.revisionsGroupByMonthInArray = [];

    this.revisions.forEach(obj => {
      // Determite key and translate it

      let temp: string | string[] = slugify(
        new RelativeDate(obj.created_at).simple()
      );
      if (/\d/.test(temp)) {
        temp = temp.split('-');
        temp = this.translateService.instant('date.' + temp[0]) + ' ' + temp[1];
      } else {
        if (temp === 'translate-month') {
          temp = new DatePipe(this.translateService.currentLang).transform(
            obj.created_at,
            'MMMM y'
          );
        } else {
          temp = this.translateService.instant('date.' + temp);
        }
      }

      const key = temp;
      // Group by key
      if (this.revisionsGroupByMonth[`${key}`]) {
        this.revisionsGroupByMonth[`${key}`].push(obj);
        // ORDER DATE ARRAY
        this.revisionsGroupByMonth[`${key}`].sort((a, b) => {
          return b.created_at - a.created_at;
        });
      } else {
        this.revisionsGroupByMonth[`${key}`] = [];
        this.revisionsGroupByMonth[`${key}`].push(obj);
      }
    });
    this.revisionsGroupByMonthInArray = Object.keys(this.revisionsGroupByMonth); // Get Properties on array
  }

  /**
   * Create a new Revision record in indexDB
   */
  newRevision(): void {
    // emit revision query
    this.revisionService.export(this.pia.id).then(exportResult => {
      this.revisionService
        .add(exportResult, this.pia.id)
        .then((resp: Revision) => {
          // Make this new revision the current version
          this.revisionService.loadRevision(resp.id);
          this.revisions.push(resp);
          this.parsingDate();
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  previewRevision(revisionId: number, event: Event, revisionDate: any): void {
    // Change circle color
    document
      .querySelectorAll('.pia-revisions-box-content-revision-item')
      .forEach(revision => {
        if (revision.classList.contains('revision-active')) {
          revision.querySelectorAll('.ng-fa-icon').forEach(icon => {
            icon.classList.toggle('hide');
          });
          revision.classList.remove('revision-active');
        }
      });

    const displayRevisionData = document.querySelector(
      '.pia-revisions-box-content-revision-item[revision-id="' +
        revisionId +
        '"]'
    );
    if (displayRevisionData) {
      /* Update circle design */
      displayRevisionData.querySelectorAll('.ng-fa-icon').forEach(icon => {
        icon.classList.toggle('hide');
      });
      /* Display data */
      displayRevisionData.classList.toggle('revision-active');
    }

    // Emit event
    this.revisionService
      .find(revisionId)
      .then((revision: any) => {
        this.preview = revision;
      })
      .catch(err => console.log(err));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
