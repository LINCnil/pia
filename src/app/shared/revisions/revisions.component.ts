import { Component, OnInit, Input } from '@angular/core';

import { ModalsService } from 'src/app/modals/modals.service';
import { RevisionService } from 'src/app/services/revision.service';
import { Pia } from 'src/app/entry/pia.model';
import { Revision } from 'src/app/models/revision.model';

@Component({
  selector: 'app-revisions',
  templateUrl: './revisions.component.html',
  styleUrls: ['./revisions.component.scss'],
  providers: [RevisionService]
})
export class RevisionsComponent implements OnInit {
  @Input() pia: Pia;
  public opened: Boolean = false;
  public revisions: Array<Revision>;

  constructor(public _modalsService: ModalsService, 
    public _revisionService: RevisionService) { }

  ngOnInit() {
    this.revisions = [];
    this._revisionService.getAll(2)
      .then((resp: Array<Revision>) => {
        if (resp) {
          this.revisions.concat(resp);
        }
      });
  }

  newRevision() {
    console.log(this.pia);
    this._revisionService.add(this.pia);
  }

  onRevisionSelection(revision, event: Event) {
    this._modalsService.openModal('revision-selection');
    event.preventDefault();
  }
}
