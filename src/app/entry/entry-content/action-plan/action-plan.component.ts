import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.scss']
})
export class ActionPlanComponent implements OnInit {

  @Input() pia: any;
  @Input() data: any;
  evaluationModel: Evaluation = new Evaluation();
  actionPlanForm: FormGroup;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    // TODO - This doesn't work as expected
    this.actionPlanForm = new FormGroup({
      actionPlanDate: new FormControl(this.pia.action_plan_date),
      actionPlanExecutive: new FormControl(this.pia.action_plan_executive)
    });
  }

  /**
   * Disables action plan fields and saves data.
   */
  actionPlanDateFocusOut() {
    const dateValue = this.actionPlanForm.value.actionPlanDate;
    const executiveValue = this.actionPlanForm.value.actionPlanExecutive;

    // Waiting for document.activeElement update
    setTimeout(() => {
      if (dateValue && dateValue.length > 0 && document.activeElement.id !== 'pia-action-plan-executive') {
        this.showActionPlanEditButton();
        this.actionPlanForm.controls['actionPlanDate'].disable();
        // Disables executive field if both fields are filled and executive isn't the next targeted element.
        if (executiveValue && executiveValue.length > 0) {
          this.actionPlanForm.controls['actionPlanExecutive'].disable();
        }
        this.pia.action_plan_date = dateValue;
        this.pia.update();
      }
      // Disables executive field too if no date, and executive is filled and isn't the next targeted element.
      if (!dateValue && executiveValue && executiveValue.length > 0 && document.activeElement.id !== 'pia-action-plan-executive') {
        this.showActionPlanEditButton();
        this.actionPlanForm.controls['actionPlanExecutive'].disable();
      }
    }, 1);
  }

  /**
   * Disables action plan fields and saves data.
   */
  actionPlanExecutiveFocusOut() {
    const dateValue = this.actionPlanForm.value.actionPlanDate;
    const executiveValue = this.actionPlanForm.value.actionPlanExecutive;

    // Waiting for document.activeElement update
    setTimeout(() => {
      if (executiveValue && executiveValue.length > 0 && document.activeElement.id !== 'pia-action-plan-date') {
        this.showActionPlanEditButton();
        this.actionPlanForm.controls['actionPlanExecutive'].disable();
        // Disables date field if both fields are filled and date isn't the next targeted element.
        if (dateValue && dateValue.length > 0) {
          this.actionPlanForm.controls['actionPlanDate'].disable();
        }
        this.pia.action_plan_executive = executiveValue;
        this.pia.update();
      }
      // Disables date field too if no executive, and dateValue is filled and isn't the next targeted element.
      if (!executiveValue && dateValue && dateValue.length > 0 && document.activeElement.id !== 'pia-action-plan-date') {
        this.showActionPlanEditButton();
        this.actionPlanForm.controls['actionPlanDate'].disable();
      }
    }, 1);
  }

  /**
   * Activates action plan fields.
   */
  activateActionPlanEdition() {
    this.hideActionPlanEditButton();
    this.actionPlanForm.controls['actionPlanDate'].enable();
    this.actionPlanForm.controls['actionPlanExecutive'].enable();
  }

  /**
   * Shows action plan edit button.
   */
  showActionPlanEditButton() {
    const editBtn = this.el.nativeElement.querySelector('#piaActionPlanPencil');
    editBtn.classList.remove('hide');
  }

  /**
   * Hides action plan edit button.
   */
  hideActionPlanEditButton() {
    const editBtn = this.el.nativeElement.querySelector('#piaActionPlanPencil');
    editBtn.classList.add('hide');
  }
}
