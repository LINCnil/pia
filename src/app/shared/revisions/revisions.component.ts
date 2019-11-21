import { Component, OnInit, Input } from '@angular/core';

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
  @Input() pia: Pia;
  public opened: Boolean = false;
  public revisions = null;
  subject = new Subject()
  public revisionsGroupByMonth;
  public revisionsGroupByMonthInArray;
  public objectKeys = Object.entries;

  constructor(public _modalsService: ModalsService, public _revisionService: RevisionService) {

      this.subject.subscribe((value) => {
        this.revisionsGroupByMonth = {}
        this.revisions.forEach((obj) => {
          const key = new Date(obj.created_at).getMonth() + '/' + new Date(obj.created_at).getFullYear();
          if (this.revisionsGroupByMonth[key])  {
            this.revisionsGroupByMonth[key].push(obj);
          } else {
            this.revisionsGroupByMonth[key] = []
            this.revisionsGroupByMonth[key].push(obj);
          }
        });
        this.revisionsGroupByMonthInArray = Object.keys(this.revisionsGroupByMonth)

      });

      

    }

  ngOnInit() {
    this._revisionService.getAll(this.pia.id)
      .then((resp) => {
        console.log(resp);
        this.revisions = resp;
        this.subject.next(resp);
      });
  }


  newRevision() {
    this._revisionService.add(this.pia)
    .then(resp => {
      this.revisions.push(resp);
      this.subject.next(resp);
    });
  }

  onRevisionSelection(revision, event: Event) {
    this._modalsService.openModal('revision-selection');
    event.preventDefault();
  }
}
