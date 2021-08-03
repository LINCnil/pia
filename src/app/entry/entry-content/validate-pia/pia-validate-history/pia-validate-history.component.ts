import { Component, ElementRef, OnInit } from '@angular/core';

import { PiaService } from 'src/app/services/pia.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'app-pia-validate-history',
  templateUrl: './pia-validate-history.component.html',
  styleUrls: ['./pia-validate-history.component.scss'],
  providers: [PiaService]
})
export class PiaValidateHistoryComponent implements OnInit {
  constructor(
    private el: ElementRef,
    public _piaService: PiaService,
    private _translateService: TranslateService,
    public _languagesService: LanguagesService
  ) {}

  ngOnInit() {
    this._piaService.getPIA();
  }

  /**
   * Shows or hides the validation history list.
   */
  displayHistoryList() {
    const historyList = this.el.nativeElement.querySelector(
      '.pia-validationHistoryBlock-content'
    );
    const btn = this.el.nativeElement.querySelector(
      '.pia-historyBlock-btn span'
    );
    btn.classList.toggle('pia-icon-accordeon-down');
    historyList.classList.toggle('close');
  }

  /**
   * Shows or hides the refuse list.
   */
  displayRefuseList() {
    const refuseList = this.el.nativeElement.querySelector(
      '.pia-validationHistoryBlock-refuse-content'
    );
    const btn = this.el.nativeElement.querySelector(
      '.pia-refuseBlock-btn span'
    );
    btn.classList.toggle('pia-icon-accordeon-down');
    refuseList.classList.toggle('close');
  }

  /**
   * Displays the validation history.
   * @returns {boolean} - True if the PIA is validated and that there was a rejection before this validation, False otherwise.
   */
  showValidationHistory() {
    return (
      (this._piaService.pia.status === 2 ||
        this._piaService.pia.status === 3) &&
      this._piaService.pia.applied_adjustements &&
      this._piaService.pia.rejected_reason
    );
  }

  /**
   * Displays the rejection history.
   * @returns {boolean} - True if the PIA is refused, False otherwise.
   */
  showRejectionHistory() {
    return this._piaService.pia.status === 1;
  }
}
