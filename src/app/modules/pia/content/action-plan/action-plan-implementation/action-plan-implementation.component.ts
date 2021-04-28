import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { Evaluation } from 'src/app/models/evaluation.model';
import { Pia } from 'src/app/models/pia.model';
import { EvaluationService } from 'src/app/services/evaluation.service';

@Component({
  selector: 'app-action-plan-implementation',
  templateUrl: './action-plan-implementation.component.html',
  styleUrls: ['./action-plan-implementation.component.scss']
})
export class ActionPlanImplementationComponent implements OnInit {
  @Input() pia: Pia = null;
  @Input() data: any;
  evaluation: Evaluation;
  actionPlanForm: FormGroup;
  displayEditButton = false;

  @ViewChild('estimatedEvaluationDate', { static: false })
  private estimatedEvaluationDate: ElementRef;
  @ViewChild('personInCharge', { static: false })
  private personInCharge: ElementRef;

  constructor(
    private globalEvaluationService: GlobalEvaluationService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.actionPlanForm = new FormGroup({
      estimatedEvaluationDate: new FormControl(),
      personInCharge: new FormControl()
    });
    if (this.data.evaluation) {
      this.evaluation = this.data.evaluation;
      const date = this.evaluation.estimated_implementation_date;
      if (date && date.toString() !== 'Invalid Date') {
        const month = (date.getMonth() + 1).toString();
        const finalMonth = (month.length === 1 ? '0' : '') + month;
        const finalDate =
          date.getFullYear() + '-' + finalMonth + '-' + date.getDate();
        this.actionPlanForm.controls['estimatedEvaluationDate'].patchValue(
          finalDate
        );
        // TODO Unable to FocusIn with Firefox
        // this.actionPlanForm.controls['estimatedEvaluationDate'].disable();
      }
      if (
        this.evaluation.person_in_charge &&
        this.evaluation.person_in_charge.length > 0
      ) {
        this.actionPlanForm.controls['personInCharge'].patchValue(
          this.evaluation.person_in_charge
        );
        // TODO Unable to FocusIn with Firefox
        // this.actionPlanForm.controls['personInCharge'].disable();
      }

      if (this.pia.status >= 2 || this.pia.is_example === 1) {
        this.actionPlanForm.controls['estimatedEvaluationDate'].disable();
        this.actionPlanForm.controls['personInCharge'].disable();
      }
    }
  }

  /**
   * Focuses estimated evaluation date field.
   */
  estimatedEvaluationDateFocusIn() {
    if (this.globalEvaluationService.evaluationEditionEnabled) {
      this.actionPlanForm.controls['estimatedEvaluationDate'].enable();
      this.estimatedEvaluationDate.nativeElement.focus();
    }
  }

  /**
   * Updates estimated evaluation date field.
   */
  estimatedEvaluationDateFocusOut() {
    const userText = this.actionPlanForm.controls['estimatedEvaluationDate']
      .value;
    this.evaluation.estimated_implementation_date = new Date(userText);
    this.evaluationService.update(this.evaluation).then(() => {
      if (userText && userText.length > 0) {
        // TODO Unable to FocusIn with Firefox
        // this.actionPlanForm.controls['estimatedEvaluationDate'].disable();
      }
    });
  }

  /**
   * Focuses estimated evaluation date field.
   */
  personInChargeFocusIn() {
    if (this.globalEvaluationService.evaluationEditionEnabled) {
      this.actionPlanForm.controls['personInCharge'].enable();
      this.personInCharge.nativeElement.focus();
    }
  }

  /**
   * Disables action plan fields and saves data.
   */
  personInChargeFocusOut() {
    let userText = this.actionPlanForm.controls['personInCharge'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.evaluation.person_in_charge = userText;
    this.evaluationService.update(this.evaluation).then(() => {
      this.actionPlanForm.controls['personInCharge'].disable();
      if (userText && userText.length > 0) {
        // TODO Unable to FocusIn with Firefox
        // this.actionPlanForm.controls['personInCharge'].disable();
      }
    });
  }
}
