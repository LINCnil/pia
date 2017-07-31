import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ModalsService } from './modals.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit {

  constructor(
    private router: Router,
    private _modalsService: ModalsService,
    private _piaService: PiaService,
    private _measuresService: MeasureService,
    private _attachmentsService: AttachmentsService
  ) { }

  ngOnInit() {

  }

  /**
   * Returns to homepage (used on several modals).
   */
  returnToHomepage() {
    this._modalsService.closeModal();
    this.router.navigate(['/home']);
  }

  /**
   *
   */
  abandonTreatment() {
    // TODO abandon treatment functionnalities (update the PIA, ...)
  }

  /**
   * Allows users to download a report about the PIA.
   */
  exportPIAReport() {
    // TODO export PIA Report
  }

}
