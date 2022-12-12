import { Component, ElementRef, Input, OnInit } from '@angular/core';

import { PiaService } from 'src/app/services/pia.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { Pia } from 'src/app/models/pia.model';

@Component({
  selector: 'app-pia-validate-history',
  templateUrl: './pia-validate-history.component.html',
  styleUrls: ['./pia-validate-history.component.scss'],
  providers: [PiaService]
})
export class PiaValidateHistoryComponent implements OnInit {
  @Input() pia: Pia = null;

  constructor(
    private el: ElementRef,
    public piaService: PiaService,
    public languagesService: LanguagesService
  ) {}

  ngOnInit() {}

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
    btn.classList.toggle('pia-icon-accordion-down');
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
    btn.classList.toggle('pia-icon-accordion-down');
    refuseList.classList.toggle('close');
  }

  /**
   * Displays the validation history.
   * @returns {boolean} - True if the PIA is validated and that there was a rejection before this validation, False otherwise.
   */
  showValidationHistory() {
    return (
      (this.pia.status === 2 || this.pia.status === 3) &&
      this.pia.applied_adjustments &&
      this.pia.rejection_reason
    );
  }

  /**
   * Displays the rejection history.
   * @returns {boolean} - True if the PIA is refused, False otherwise.
   */
  showRejectionHistory() {
    return this.pia.status === 1;
  }
}
