import {Component, ElementRef, OnInit} from '@angular/core';

import { Pia } from 'app/entry/pia.model';

import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-pia-validate-history',
  templateUrl: './pia-validate-history.component.html',
  styleUrls: ['./pia-validate-history.component.scss'],
  providers: [PiaService]
})
export class PiaValidateHistoryComponent implements OnInit {

  constructor(private el: ElementRef, private _piaService: PiaService) { }

  ngOnInit() {
    this._piaService.getPIA();
  }

  /**
   * Shows or hides the validation history list.
   */
  displayHistoryList() {
    const historyList = this.el.nativeElement.querySelector('.pia-validationHistoryBlock-content');
    const btn = this.el.nativeElement.querySelector('.pia-historyBlock-btn span');
    btn.classList.toggle('pia-icon-accordeon-down');
    historyList.classList.toggle('close');
  }

  /**
   * Shows or hides the refuse list.
   */
  displayRefuseList() {
    const refuseList = this.el.nativeElement.querySelector('.pia-validationHistoryBlock-refuse-content');
    const btn = this.el.nativeElement.querySelector('.pia-refuseBlock-btn span');
    btn.classList.toggle('pia-icon-accordeon-down');
    refuseList.classList.toggle('close');
  }

  /**
   * Displays the validation history.
   * @return true if the PIA is validated and that there was a rejection before this validation, false otherwise.
   */
  showValidationHistory() {
    return ((this._piaService.pia.status === 2 || this._piaService.pia.status === 3) &&
            this._piaService.pia.applied_adjustements &&
            this._piaService.pia.rejected_reason);
  }

  /**
   * Displays the rejection history.
   * @return true if the PIA is refused, false otherwise.
   */
  showRejectionHistory() {
    return (this._piaService.pia.status === 1);
  }

}
