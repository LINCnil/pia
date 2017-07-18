import {Component, ElementRef, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit {

  evaluationForm: FormGroup;

  constructor(private el: ElementRef) { }

  ngOnInit() {
      this.evaluationForm = new FormGroup({
      evaluationActionPlan: new FormControl(),
      evaluationComment: new FormControl()
    });
  }

  /**
   * Executes various functionnalities when evaluating an item/question/section.
   * (displaying edit button, displaying evaluation content with fields, switch value from action plan field to comment field, ...)
   * @param {Event} event any event.
   */
  selectedButton(event) {
    const actionPlan = this.el.nativeElement.querySelector('.pia-evaluationBlock-actionPlan');
    const clickedBtn = event.target || event.srcElement || event.currentTarget;

    // Hides evaluation edit button if it is displayed.
    const editBtn = this.el.nativeElement.querySelector('.pia-evaluationBlock-edit');
    if (!editBtn.classList.contains('hide')) {
      editBtn.classList.add('hide');
    }

    // Activates (or reactivates after a choice change) evaluation edition on all fields.
    this.activateEvaluationEdition();

    // Shows action plan field on "improvable" evaluation.
    if (clickedBtn.getAttribute('data-btn-type')) {
      actionPlan.classList.add('show');
    } else {
      // Hides action plan field + switchs its value to comment field + removes its value.
      const evaluationPlanValue = this.evaluationForm.value.evaluationActionPlan;
      const commentValue = this.evaluationForm.value.evaluationComment;
      if (evaluationPlanValue && evaluationPlanValue.length > 0) {
        // Checks if there is an evaluation comment to concatenate it after the action plan value.
        if (commentValue && commentValue.length > 0) {
          this.evaluationForm.controls['evaluationComment'].setValue(evaluationPlanValue + '\n' + this.evaluationForm.controls['evaluationComment'].value);
        } else {
          this.evaluationForm.controls['evaluationComment'].setValue(evaluationPlanValue);
        }
        // Deletes the value from action plan field.
        this.evaluationForm.controls['evaluationActionPlan'].setValue('');
      }
      actionPlan.classList.remove('show');
    }

    // Disables active classes for all evaluation buttons.
    // Adds an active class and removes previous disable attribute from the current button.
    const allBtn = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons .btn');
    [].forEach.call(allBtn, function(btn) {
      btn.classList.remove('btn-active');
    });
    clickedBtn.classList.add('btn-active');
    clickedBtn.removeAttribute('disabled');

    // Displays content (action plan & comment fields).
    const content = this.el.nativeElement.querySelector('.pia-evaluationBlock-content');
    content.classList.add('show');
  }

  /**
   * Hides evaluation edit button for the action plan field.
   */
  evaluationActionPlanFocus() {
    this.hideEvaluationEditButton();
  }

  /**
   * Disables action plan field when losing focus from it.
   * Disables inactive evaluation buttons (or does nothing if one has been clicked right after unfocus).
   * Shows evaluation edit button.
   * Saves data from action plan field.
   */
  evaluationActionPlanFocusOut() {
    const actionPlanValue = this.evaluationForm.value.evaluationActionPlan;
    const commentValue = this.evaluationForm.value.evaluationComment;
    let noEvaluationButtonsClicked = true;
    const evaluationButtons = document.querySelectorAll('.pia-evaluationBlock-buttons button');

    // Waiting for document.activeElement update
    setTimeout(()=>{
      if (actionPlanValue && actionPlanValue.length > 0 && document.activeElement.id != 'pia-evaluation-comment') {
        this.showEvaluationEditButton();
        this.evaluationForm.controls['evaluationActionPlan'].disable();
        [].forEach.call(evaluationButtons, function(btn) {
          if (document.activeElement === btn) {
            noEvaluationButtonsClicked = false;
          }
        });
        if (noEvaluationButtonsClicked) {
          this.disableEvaluationButtons();
        }
        // Disables comment field if both fields are filled and comment isn't the next targeted element.
        if (commentValue && commentValue.length > 0) {
          this.evaluationForm.controls['evaluationComment'].disable();
        }
        // TODO : save data
      }
      // Disables comment field too if no action plan and comment is filled and isn't the next targeted element.
      if (!actionPlanValue && commentValue && commentValue.length > 0 && document.activeElement.id != 'pia-evaluation-comment') {
        this.showEvaluationEditButton();
        this.evaluationForm.controls['evaluationComment'].disable();
      }
    },1);
  }

  /**
   * Hides evaluation edit button for the comment field.
   */
  evaluationCommentFocus() {
    this.hideEvaluationEditButton();
  }

  /**
   * Disables comment field when losing focus from it.
   * Disables inactive evaluation buttons (or does nothing if one has been clicked right after unfocus).
   * Shows evaluation edit button.
   * Saves data from comment field.
   */
  evaluationCommentFocusOut() {
    const actionPlanValue = this.evaluationForm.value.evaluationActionPlan;
    const commentValue = this.evaluationForm.value.evaluationComment;
    let noEvaluationButtonsClicked = true;
    const evaluationButtons = document.querySelectorAll('.pia-evaluationBlock-buttons button');

    // Waiting for document.activeElement update
    setTimeout(()=>{
      if (commentValue && commentValue.length > 0 && document.activeElement.id != 'pia-evaluation-action-plan') {
        this.showEvaluationEditButton();
        this.evaluationForm.controls['evaluationComment'].disable();
        [].forEach.call(evaluationButtons, function(btn) {
          if (document.activeElement === btn) {
            noEvaluationButtonsClicked = false;
          }
        });
        if (noEvaluationButtonsClicked) {
          this.disableEvaluationButtons();
        }
        // Disables action plan field if both fields are filled and action plan isn't the next targeted element.
        if (actionPlanValue && actionPlanValue.length > 0) {
          this.evaluationForm.controls['evaluationActionPlan'].disable();
        }
        // TODO : save data
      }
      // Disables action plan field too if no comment and action plan is filled and isn't the next targeted element.
      if (!commentValue && actionPlanValue && actionPlanValue.length > 0 && document.activeElement.id != 'pia-evaluation-action-plan') {
        this.showEvaluationEditButton();
        this.evaluationForm.controls['evaluationActionPlan'].disable();
      }
    },1);
  }

  /**
   * Activates evaluation buttons and evaluation fields.
   */
  activateEvaluationEdition() {
    this.enableEvaluationButtons();
    this.evaluationForm.controls['evaluationActionPlan'].enable();
    this.evaluationForm.controls['evaluationComment'].enable();
  }

  /**
   * Shows evaluation edit button.
   */
  showEvaluationEditButton() {
    const editBtn = this.el.nativeElement.querySelector('.pia-evaluationBlock-edit');
    editBtn.classList.remove('hide');
  }

  /**
   * Hides evaluation edit button.
   */
  hideEvaluationEditButton() {
    const editBtn = this.el.nativeElement.querySelector('.pia-evaluationBlock-edit');
    editBtn.classList.add('hide');
  }

  /**
   * Disables evaluation buttons except the active one.
   */
  disableEvaluationButtons() {
    const evaluationButtons = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons .btn');
    [].forEach.call(evaluationButtons, function(btn) {
      if (!btn.classList.contains('btn-active')) {
        btn.setAttribute('disabled', true);
      }
    });
  }

  /**
   * Enables evaluation buttons except the active one.
   */
  enableEvaluationButtons() {
    const evaluationButtons = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons button');
    [].forEach.call(evaluationButtons, function(btn) {
      btn.removeAttribute('disabled');
    });
  }

}
