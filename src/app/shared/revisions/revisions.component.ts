import { Component, OnInit } from '@angular/core';

import { ModalsService } from 'src/app/modals/modals.service';

@Component({
  selector: 'app-revisions',
  templateUrl: './revisions.component.html',
  styleUrls: ['./revisions.component.scss']
})
export class RevisionsComponent implements OnInit {
  public opened: Boolean = false;

  constructor(public _modalsService: ModalsService) { }

  ngOnInit() {
  }

  onRevisionSelection(revision, event:Event) {
    this._modalsService.openModal('revision-selection');
    event.preventDefault();
  }
}
