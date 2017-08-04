import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { Evaluation } from './evaluation.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';

import { EvaluationService } from './evaluations.service';

/**
 * TODO : switch the redundant code about evaluation update here in an EvaluationsService...
 * Create a method like "updateEvaluation(section, item, pia.id, data)"
 * Where datas would contain all evaluation information :
 * clicked button to set evaluation status,
 * action plan comment,
 * evaluation comment,
 * ...
 * /!\ The fact that it doesn't update evaluations right after feeling questions/measures
 * probably comes from this point... that's why we should probably use a service.
 */

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit {

  evaluationForm: FormGroup;
  @Input() item: any;
  @Input() pia: any;
  @Input() section: any;
  @Input() questionId: any;
  @Input() measureId: any;

  constructor(private el: ElementRef, private _evaluationsService: EvaluationService) { }

  ngOnInit() {
    const evaluationGaugesValues = this._evaluationsService.getGaugesValues().then((data) => {

    });

    this.evaluationForm = new FormGroup({
      evaluationActionPlan: new FormControl(),
      evaluationComment: new FormControl(),
      gaugeImpactX: new FormControl(),
      gaugeGravityY: new FormControl()
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

    const buttonStatus = clickedBtn.getAttribute('data-btn-type');


    // "improvable" evaluation state, with action plan.
    if (buttonStatus === 'improvable') {
      actionPlan.classList.add('show');
      // Updates evaluation status
      const evaluationModel = new Evaluation();
      const answerModel = new Answer();
      if (this.item.evaluation_mode === 'item') {
        const item_reference = this.section.id + '.' + this.item.id;
        evaluationModel.getByReference(this.pia.id, item_reference).then(() => {
          evaluationModel.status = 2;
          evaluationModel.update();
        });
      } else {
        // Measure evaluation update
        if (this.section.id === 3 && this.item.id === 1) {
          const measure_reference = this.section.id + '.' + this.item.id + '.' + this.measureId; // Ex : 3.1.8
          evaluationModel.getByReference(this.pia.id, measure_reference).then(() => {
            evaluationModel.status = 2;
            evaluationModel.update();
          });
        } else {
          // Question evaluation update
          answerModel.getByReferenceAndPia(this.pia.id, this.questionId).then(() => {
            if (answerModel.data) {
              evaluationModel.getByReference(this.pia.id, this.questionId).then(() => {
                evaluationModel.status = 2;
                evaluationModel.update();
              });
            }
          });
        }
      }
    } else {
      // "toBeFixed" or "acceptable" evaluation states.
      // Updates evaluation status
      const evaluationModel = new Evaluation();
      const answerModel = new Answer();
      let statusToBeUpdated;
      if (buttonStatus === 'toBeFixed') {
        statusToBeUpdated = 1;
      } else {
        statusToBeUpdated = 3;
      }
      if (this.item.evaluation_mode === 'item') {
        const item_reference = this.section.id + '.' + this.item.id;
        evaluationModel.getByReference(this.pia.id, item_reference).then(() => {
          evaluationModel.status = statusToBeUpdated;
          evaluationModel.update();
        });
      } else {
        // Measure evaluation update
        if (this.section.id === 3 && this.item.id === 1) {
          const measure_reference = this.section.id + '.' + this.item.id + '.' + this.measureId; // Ex : 3.1.8
          evaluationModel.getByReference(this.pia.id, measure_reference).then(() => {
            evaluationModel.status = statusToBeUpdated;
            evaluationModel.update();
          });
        } else {
          // Question evaluation update
          answerModel.getByReferenceAndPia(this.pia.id, this.questionId).then(() => {
            if (answerModel.data) {
              evaluationModel.getByReference(this.pia.id, this.questionId).then(() => {
                evaluationModel.status = statusToBeUpdated;
                evaluationModel.update();
              });
            }
          });
        }
      }

      // Hides action plan field + switchs its value to comment field + removes its value.
      const evaluationPlanValue = this.evaluationForm.value.evaluationActionPlan;
      const commentValue = this.evaluationForm.value.evaluationComment;
      if (evaluationPlanValue && evaluationPlanValue.length > 0) {
        // Checks if there is an evaluation comment to concatenate it after the action plan value.
        if (commentValue && commentValue.length > 0) {
          this.evaluationForm.controls['evaluationComment'].setValue(evaluationPlanValue + '\n'
            + this.evaluationForm.controls['evaluationComment'].value);
        } else {
          this.evaluationForm.controls['evaluationComment'].setValue(evaluationPlanValue);
        }
        // Deletes the value from action plan field.
        this.evaluationForm.controls['evaluationActionPlan'].setValue('');
        /*
          TODO : update the 'action_plan_comment' attribute in THIS particular case.
          Action plan is transfered in comment field, so we have to update in DB too...
          evaluationModel.action_plan_comment = undefined
        */
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
    setTimeout(() => {
      // Evaluation update on items / questions / measures
      const evaluationModel = new Evaluation();
      const answerModel = new Answer();
      if (this.item.evaluation_mode === 'item') {
        const item_reference = this.section.id + '.' + this.item.id;
        evaluationModel.getByReference(this.pia.id, item_reference).then(() => {
          evaluationModel.action_plan_comment = actionPlanValue;
          evaluationModel.update();
        });
      } else {
        // Measure evaluation update
        if (this.section.id === 3 && this.item.id === 1) {
          const measure_reference = this.section.id + '.' + this.item.id + '.' + this.measureId; // Ex : 3.1.8
          evaluationModel.getByReference(this.pia.id, measure_reference).then(() => {
            evaluationModel.action_plan_comment = actionPlanValue;
            evaluationModel.update();
          });
        } else {
          // Question evaluation update
          answerModel.getByReferenceAndPia(this.pia.id, this.questionId).then(() => {
            if (answerModel.data) {
              evaluationModel.getByReference(this.pia.id, this.questionId).then(() => {
                evaluationModel.action_plan_comment = actionPlanValue;
                evaluationModel.update();
              });
            }
          });
        }
      }
      if (actionPlanValue && actionPlanValue.length > 0 && document.activeElement.id !== 'pia-evaluation-comment') {
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
      }
      // Disables comment field too if no action plan and comment is filled and isn't the next targeted element.
      if (!actionPlanValue && commentValue && commentValue.length > 0 && document.activeElement.id !== 'pia-evaluation-comment') {
        this.showEvaluationEditButton();
        this.evaluationForm.controls['evaluationComment'].disable();
      }
    }, 1);
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
    setTimeout(() => {
      // Evaluation update on items / questions / measures
      const evaluationModel = new Evaluation();
      const answerModel = new Answer();
      if (this.item.evaluation_mode === 'item') {
        const item_reference = this.section.id + '.' + this.item.id;
        evaluationModel.getByReference(this.pia.id, item_reference).then(() => {
          evaluationModel.evaluation_comment = commentValue;
          evaluationModel.update();
        });
      } else {
        // Measure evaluation update
        if (this.section.id === 3 && this.item.id === 1) {
          const measure_reference = this.section.id + '.' + this.item.id + '.' + this.measureId; // Ex : 3.1.8
          evaluationModel.getByReference(this.pia.id, measure_reference).then(() => {
            evaluationModel.evaluation_comment = commentValue;
            evaluationModel.update();
          });
        } else {
          // Question evaluation update
          answerModel.getByReferenceAndPia(this.pia.id, this.questionId).then(() => {
            if (answerModel.data) {
              evaluationModel.getByReference(this.pia.id, this.questionId).then(() => {
                evaluationModel.evaluation_comment = commentValue;
                evaluationModel.update();
              });
            }
          });
        }
      }
      if (commentValue && commentValue.length > 0 && document.activeElement.id !== 'pia-evaluation-action-plan') {
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
      }
      // Disables action plan field too if no comment and action plan is filled and isn't the next targeted element.
      if (!commentValue && actionPlanValue && actionPlanValue.length > 0 && document.activeElement.id !== 'pia-evaluation-action-plan') {
        this.showEvaluationEditButton();
        this.evaluationForm.controls['evaluationActionPlan'].disable();
      }
    }, 1);
  }

  /* TODO : update evaluation with gauges */

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
