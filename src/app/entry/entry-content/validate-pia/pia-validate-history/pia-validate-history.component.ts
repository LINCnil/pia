import {Component, ElementRef, OnInit} from '@angular/core';

import { Pia } from 'app/entry/pia.model';

import { PiaService } from 'app/services/pia.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pia-validate-history',
  templateUrl: './pia-validate-history.component.html',
  styleUrls: ['./pia-validate-history.component.scss'],
  providers: [PiaService]
})
export class PiaValidateHistoryComponent implements OnInit {

  constructor(private el: ElementRef,
              public _piaService: PiaService,
              private _translateService: TranslateService) { }

  ngOnInit() {
    this._piaService.getPIA();
  }

  /**
   * Shows or hides the validation history list.
   * @memberof PiaValidateHistoryComponent
   */
  displayHistoryList() {
    const historyList = this.el.nativeElement.querySelector('.pia-validationHistoryBlock-content');
    const btn = this.el.nativeElement.querySelector('.pia-historyBlock-btn span');
    btn.classList.toggle('pia-icon-accordeon-down');
    historyList.classList.toggle('close');
  }

  /**
   * Shows or hides the refuse list.
   * @memberof PiaValidateHistoryComponent
   */
  displayRefuseList() {
    const refuseList = this.el.nativeElement.querySelector('.pia-validationHistoryBlock-refuse-content');
    const btn = this.el.nativeElement.querySelector('.pia-refuseBlock-btn span');
    btn.classList.toggle('pia-icon-accordeon-down');
    refuseList.classList.toggle('close');
  }

  /**
   * Displays the validation history.
   * @returns {boolean} - True if the PIA is validated and that there was a rejection before this validation, False otherwise.
   * @memberof PiaValidateHistoryComponent
   */
  showValidationHistory() {
    return ((this._piaService.pia.status === 2 || this._piaService.pia.status === 3) &&
            this._piaService.pia.applied_adjustements &&
            this._piaService.pia.rejected_reason);
  }

  /**
   * Displays the rejection history.
   * @returns {boolean} - True if the PIA is refused, False otherwise.
   * @memberof PiaValidateHistoryComponent
   */
  showRejectionHistory() {
    return (this._piaService.pia.status === 1);
  }

}
