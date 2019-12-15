import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges
} from "@angular/core";
import { Subscription } from "rxjs";

import { ModalsService } from "src/app/modals/modals.service";
import { RevisionService } from "src/app/services/revision.service";
import { Pia } from "src/app/entry/pia.model";
import { Revision } from "src/app/models/revision.model";
import { Subject, iif } from "rxjs";
import { RelativeDate } from "../RelativeDate.class";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";

function slugify(string) {
  const a =
    "àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;";
  const b =
    "aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

@Component({
  selector: "app-revisions",
  templateUrl: "./revisions.component.html",
  styleUrls: ["./revisions.component.scss"],
  providers: [RevisionService, TranslateService]
})
export class RevisionsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentVersion: Date;
  @Input() revisions: Array<any>;
  @Input() title: boolean = true;
  @Output("newRevisionQuery") newRevisionEmitter = new EventEmitter();
  @Output("selectedRevisionQuery") selectedRevisionEmitter = new EventEmitter();

  subscription: Subscription;
  public opened: Boolean = false;
  subject = new Subject();
  public revisionsGroupByMonth;
  public revisionsGroupByMonthInArray;
  public objectKeys = Object.entries;
  dateFormat: String;

  constructor(private _translateService: TranslateService) {}

  ngOnInit() {
    this._translateService.currentLang === "fr"
      ? (this.dateFormat = "dd/MM/yy HH:mm:ss")
      : (this.dateFormat = "MM-dd-yy HH:mm:ss");
    this.subscription = this._translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this._translateService.currentLang === "fr"
          ? (this.dateFormat = "dd/MM/yy HH:mm:ss")
          : (this.dateFormat = "MM-dd-yy HH:mm:ss");
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update RevisionGroupByMonth on this.revisions changements
    this.generateDates(changes);
    this.subscription = this._translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.generateDates(changes);
      }
    );
  }

  generateDates(changes) {
    this.revisionsGroupByMonth = {};
    if (changes.revisions && changes.revisions.currentValue) {
      changes.revisions.currentValue.forEach(obj => {
        // Determite key and translate it

        let temp = slugify(new RelativeDate(obj.created_at).simple());
        if (/\d/.test(temp)) {
          temp = temp.split("-");
          temp =
            this._translateService.instant("date." + temp[0]) + " " + temp[1];
        } else {
          temp = this._translateService.instant("date." + temp);
        }
        const key = temp;

        // Group by key
        if (this.revisionsGroupByMonth[key]) {
          this.revisionsGroupByMonth[key].push(obj);
        } else {
          this.revisionsGroupByMonth[key] = [];
          this.revisionsGroupByMonth[key].push(obj);
        }
      });
      this.revisionsGroupByMonthInArray = Object.keys(
        this.revisionsGroupByMonth
      ); // Get Properties on array
    }
  }

  newRevision() {
    // emit revision query
    this.newRevisionEmitter.emit();
  }

  onRevisionSelection(revision, event: Event) {
    // emit revision selection
    this.selectedRevisionEmitter.emit(revision);
    event.preventDefault();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
