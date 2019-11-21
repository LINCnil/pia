import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

import { ModalsService } from 'src/app/modals/modals.service';
import { RevisionService } from 'src/app/services/revision.service';
import { Pia } from 'src/app/entry/pia.model';
import { Revision } from 'src/app/models/revision.model';
import { Subject, iif } from 'rxjs';

@Component({
  selector: 'app-revisions',
  templateUrl: './revisions.component.html',
  styleUrls: ['./revisions.component.scss'],
  providers: [RevisionService]
})
export class RevisionsComponent implements OnInit {
  @Input() revisions: Array<any>;
  @Output('newRevisionQuery') newRevisionEmitter = new EventEmitter();
  @Output('selectedRevisionQuery') selectedRevisionEmitter = new EventEmitter();

  public opened: Boolean = false;
  subject = new Subject();
  public revisionsGroupByMonth;
  public revisionsGroupByMonthInArray;
  public objectKeys = Object.entries;

  constructor() {
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {

    // Update RevisionGroupByMonth on this.revisions changements
    this.revisionsGroupByMonth = {}
    if (changes.revisions.currentValue) {
      changes.revisions.currentValue.forEach((obj) => {
        const key = new Date(new Date(obj.created_at).getUTCFullYear(), new Date(obj.created_at).getMonth(), 1);
        if (this.revisionsGroupByMonth[key])  {
          this.revisionsGroupByMonth[key].push(obj);
        } else {
          this.revisionsGroupByMonth[key] = []
          this.revisionsGroupByMonth[key].push(obj);
        }
      });
      this.revisionsGroupByMonthInArray = Object.keys(this.revisionsGroupByMonth) // Get Properties on array
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
}
