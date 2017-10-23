import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

@Component({
  selector: 'app-action-plan-implementation',
  templateUrl: './action-plan-implementation.component.html',
  styleUrls: ['./action-plan-implementation.component.scss']
})
export class ActionPlanImplementationComponent implements OnInit {

  @Input() data: any;
  evaluation: Evaluation;
  actionPlanForm: FormGroup;
  displayEditButton = false;

  constructor() { }

  ngOnInit() {
    this.actionPlanForm = new FormGroup({
      estimatedEvaluationDate: new FormControl(),
      personInCharge: new FormControl()
    });
    if (this.data.evaluation) {
      this.evaluation = this.data.evaluation;
      const date = this.evaluation.estimated_implementation_date;
      if (date) {
        const month = (date.getMonth() + 1).toString();
        const finalMonth = (month.length === 1 ? '0' : '' ) + month;
        const finalDate =  date.getFullYear() + '-' + finalMonth + '-' + date.getDate();
        this.actionPlanForm.controls['estimatedEvaluationDate'].patchValue(finalDate);
      }
      this.actionPlanForm.controls['personInCharge'].patchValue(this.evaluation.person_in_charge);
    }
  }


  /**
   * Disables action plan fields and saves data.
   */
  estimatedEvaluationDateFocusOut() {
    const estimatedEvaluationDate = this.actionPlanForm.value.estimatedEvaluationDate;
    const personInCharge = this.actionPlanForm.value.personInCharge;

    // Waiting for document.activeElement update
    setTimeout(() => {
      if (estimatedEvaluationDate && estimatedEvaluationDate.length > 0) {
        this.displayEditButton = true;
        this.actionPlanForm.controls['estimatedEvaluationDate'].disable();
        // Disables executive field if both fields are filled and executive isn't the next targeted element.
        if (personInCharge && personInCharge.length > 0) {
          this.actionPlanForm.controls['personInCharge'].disable();
        }
        this.evaluation.estimated_implementation_date = estimatedEvaluationDate;
        this.evaluation.update();
      }
      // Disables executive field too if no date, and executive is filled and isn't the next targeted element.
      if (!estimatedEvaluationDate && personInCharge && personInCharge.length > 0) {
        this.displayEditButton = true;
        this.actionPlanForm.controls['personInCharge'].disable();
      }
    }, 1);
  }

  /**
   * Disables action plan fields and saves data.
   */
  personInChargeFocusOut() {
    const estimatedEvaluationDate = this.actionPlanForm.value.estimatedEvaluationDate;
    const personInCharge = this.actionPlanForm.value.personInCharge;

    // Waiting for document.activeElement update
    setTimeout(() => {
      if (personInCharge && personInCharge.length > 0) {
        this.displayEditButton = true;
        this.actionPlanForm.controls['personInCharge'].disable();
        // Disables date field if both fields are filled and date isn't the next targeted element.
        if (estimatedEvaluationDate && estimatedEvaluationDate.length > 0) {
          this.actionPlanForm.controls['estimatedEvaluationDate'].disable();
        }
        this.evaluation.person_in_charge = personInCharge;
        this.evaluation.update();
      }
      // Disables date field too if no executive, and estimatedEvaluationDate is filled and isn't the next targeted element.
      if (!personInCharge && estimatedEvaluationDate && estimatedEvaluationDate.length > 0) {
        this.displayEditButton = true;
        this.actionPlanForm.controls['estimatedEvaluationDate'].disable();
      }
    }, 1);
  }

  /**
   * Activates action plan fields.
   */
  activateActionPlanEdition() {
    this.displayEditButton = false;
    this.actionPlanForm.controls['estimatedEvaluationDate'].enable();
    this.actionPlanForm.controls['personInCharge'].enable();
  }

}
