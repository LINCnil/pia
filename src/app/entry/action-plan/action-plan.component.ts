import {Component, ElementRef, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.scss']
})
export class ActionPlanComponent implements OnInit {

  actionPlanForm: FormGroup;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.actionPlanForm = new FormGroup({
      actionPlanDate : new FormControl(),
      actionPlanExecutive: new FormControl()
    });
  }

  /**
  * Disables action plan fields and saves data.
  */
  actionPlanDateFocusOut() {
      this.actionPlanForm.controls['actionPlanDate'].disable();
      this.showActionPlanEditButton();
    // Saving data here
  }

  actionPlanExecutiveFocusOut() {
    this.actionPlanForm.controls['actionPlanExecutive'].disable();
    this.showActionPlanEditButton();
    // Saving data here
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
