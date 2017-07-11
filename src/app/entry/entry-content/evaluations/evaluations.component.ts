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
      if (this.evaluationForm.value.evaluationActionPlan && this.evaluationForm.value.evaluationActionPlan.length > 0) {
        // Checks if there is an evaluation comment to concatenate it after the action plan value.
        if (this.evaluationForm.value.evaluationComment && this.evaluationForm.value.evaluationComment.length > 0) {
          this.evaluationForm.controls['evaluationComment'].setValue(this.evaluationForm.value.evaluationActionPlan + '\n' + this.evaluationForm.controls['evaluationComment'].value);
        } else {
          this.evaluationForm.controls['evaluationComment'].setValue(this.evaluationForm.value.evaluationActionPlan);
        }
        // Deletes the value from action plan field.
        this.evaluationForm.controls['evaluationActionPlan'].setValue('');
      }
      actionPlan.classList.remove('show');
    }

    // Disables active classes + sets disabled attributes for all evaluation buttons.
    const allBtn = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons .btn');
    [].forEach.call(allBtn, function(btn) {
      btn.classList.remove('btn-active');
      /*btn.setAttribute('disabled', true);*/
    });

    // Adds an active class + removes previous disable attribute from current button.
    clickedBtn.classList.add('btn-active');
    clickedBtn.removeAttribute('disabled');

    // Displays content (action plan & comment fields).
    const content = this.el.nativeElement.querySelector('.pia-evaluationBlock-content');
    content.classList.add('show');
  }

  /**
   * Hides evaluation edit button.
   */
  evaluationActionPlanFocus() {
    this.hideEvaluationEditButton();
  }

  /**
   * Disables action plan field when losing focus from it + shows evaluation edit button.
   */
  evaluationActionPlanFocusOut() {
    if (this.evaluationForm.value.evaluationActionPlan && this.evaluationForm.value.evaluationActionPlan.length > 0) {
      this.showEvaluationEditButton();
      this.evaluationForm.controls['evaluationActionPlan'].disable();
      // TODO : save data
    }
  }

  /**
   * Hides evaluation edit button.
   */
  evaluationCommentFocus() {
    this.hideEvaluationEditButton();
  }

  /**
   * Disables comment field when losing focus from it + shows evaluation edit button.
   */
  evaluationCommentFocusOut() {
    if (this.evaluationForm.value.evaluationComment && this.evaluationForm.value.evaluationComment.length > 0) {
      this.showEvaluationEditButton();
      this.evaluationForm.controls['evaluationComment'].disable();
      // TODO : save data
    }
  }

  /**
   * Enables edition mode for evaluation : activates buttons and fields.
   */
  activateEvaluationEdition() {
    // A conserver si on garde l'effet "disabled" des buttons de la méthode selectedButton(event)
    // Enables evaluation buttons.
    /*const buttonsToEnable = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons button');
    [].forEach.call(buttonsToEnable, function(btn) {
      btn.removeAttribute('disabled');
    });*/

    // Enables evaluation fields.
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

}
