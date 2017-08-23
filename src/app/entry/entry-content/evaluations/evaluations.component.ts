import { Component, ElementRef, OnInit, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { Evaluation } from './evaluation.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';

import { EvaluationService } from './evaluations.service';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit, DoCheck {

  evaluationForm: FormGroup;
  @Input() item: any;
  @Input() pia: any;
  @Input() section: any;
  @Input() questionId: any;
  @Input() measureId: any;
  @Output() evaluationEvent = new EventEmitter<Evaluation>();
  evaluation: Evaluation;
  reference_to: string;
  displayEditButton = false;
  previousGauges = {x: 0, y: 0};
  previousReferenceTo: string;

  constructor(private el: ElementRef, private _evaluationService: EvaluationService) { }

  ngOnInit() {
    // Prefix item
    this.reference_to = this.section.id + '.' + this.item.id;
    this.checkEvaluationValidation();
  }

  ngDoCheck() {
    // Prefix item
    this.reference_to = this.section.id + '.' + this.item.id;
    if (this.item.evaluation_mode === 'item' && this.previousReferenceTo !== this.reference_to) {
      this.previousReferenceTo = this.reference_to;
      this.checkEvaluationValidation();
    }
  }

  private checkEvaluationValidation() {
    if (this.item.evaluation_mode === 'question') {
      // Measure evaluation update
      if (this.item.is_measure) {
        this.reference_to += '.' + this.measureId;
      } else {
        // Question evaluation update
        this.reference_to += '.' + this.questionId;
      }
    }

    this.evaluationForm = new FormGroup({
      actionPlanComment: new FormControl(),
      evaluationComment: new FormControl(),
      gaugeX: new FormControl(),
      gaugeY: new FormControl()
    });

    this.evaluation = new Evaluation();
    this.evaluation.getByReference(this.pia.id, this.reference_to).then(() => {
      // Pass the evaluation to the parent component
      this.evaluationEvent.emit(this.evaluation);

      if (!this.evaluation.gauges) {
        this.evaluation.gauges = {x: 0, y: 0};
      }
      this.evaluationForm.controls['actionPlanComment'].patchValue(this.evaluation.action_plan_comment);
      this.evaluationForm.controls['evaluationComment'].patchValue(this.evaluation.evaluation_comment);
      if (this.evaluation.gauges) {
        this.evaluationForm.controls['gaugeX'].patchValue(this.evaluation.gauges['x']);
        this.evaluationForm.controls['gaugeX'].disable();
        this.evaluationForm.controls['gaugeY'].patchValue(this.evaluation.gauges['y']);
        this.evaluationForm.controls['gaugeY'].disable();
        this.displayEditButton = true;
      } else {
        this.evaluationForm.controls['gaugeX'].patchValue(0);
        this.evaluationForm.controls['gaugeY'].patchValue(0);
      }
      if (this.evaluation.action_plan_comment && this.evaluation.action_plan_comment.length > 0) {
        this.displayEditButton = true;
        this.evaluationForm.controls['actionPlanComment'].disable();
      }
      if (this.evaluation.evaluation_comment && this.evaluation.evaluation_comment.length > 0) {
        this.displayEditButton = true;
        this.evaluationForm.controls['evaluationComment'].disable();
      }

      // Textareas auto resize
      /*const evaluationActionPlanTextarea = document.getElementById('pia-evaluation-action-plan-' + this.evaluation.id);
      if (evaluationActionPlanTextarea) {
        this.autoTextareaResize(null, evaluationActionPlanTextarea);
      }
      const evaluationCommentTextarea = document.getElementById('pia-evaluation-comment' + this.evaluation.id);
      if (evaluationCommentTextarea) {
        this.autoTextareaResize(null, evaluationCommentTextarea);
      }*/
    });

    if (this.item.questions) {
      const questions: any[] = this.item.questions.filter((question) => {
        return question.answer_type === 'gauge';
      });
      questions.forEach(question => {
        const answersModel = new Answer();
        answersModel.getByReferenceAndPia(this.pia.id, question.id).then(() => {
          if (answersModel.data) {
            this.previousGauges[question.cartography.split('_')[1]] = answersModel.data.gauge;
          }
        });
      });
    }
    this._evaluationService.isAllEvaluationValidated();

    // TODO THe line below doesn't work
    this._evaluationService.checkForFinalValidation(this.evaluation);
  }

  /**
   * Executes various functionnalities when evaluating an item/question/section.
   * (displaying edit button, displaying evaluation content with fields, switch value from action plan field to comment field, ...)
   * @param {Event} event any event.
   */
  selectedButton(event, status: number) {
    // Activates (or reactivates after a choice change) evaluation edition on all fields.
    this.activateEvaluationEdition();
    this.evaluation.status = status;

    if (status !== 2) {
      // Hides action plan field + switchs its value to comment field + removes its value.
      const evaluationPlanValue = this.evaluationForm.value.actionPlanComment;
      const commentValue = this.evaluationForm.value.evaluationComment;
      if (evaluationPlanValue && evaluationPlanValue.length > 0) {
        // Checks if there is an evaluation comment to concatenate it after the action plan value.
        if (commentValue && commentValue.length > 0) {
          this.evaluationForm.controls['evaluationComment'].setValue(evaluationPlanValue + '\n' + commentValue);
        } else {
          this.evaluationForm.controls['evaluationComment'].setValue(evaluationPlanValue);
        }
        this.evaluationForm.controls['actionPlanComment'].setValue('');
        this.evaluation.evaluation_comment = this.evaluationForm.value.evaluationComment;
        this.evaluation.action_plan_comment = undefined;
      }
    }
    this.evaluation.update().then(() => {
      // Pass the evaluation to the parent component
      this.evaluationEvent.emit(this.evaluation);
    });

    // Disables active classes for all evaluation buttons.
    // Adds an active class and removes previous disable attribute from the current button.
    this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons .btn').forEach((btn) => {
      btn.classList.remove('btn-active');
    });
    // clickedBtn.classList.add('btn-active');
    // clickedBtn.removeAttribute('disabled');

    // Displays content (action plan & comment fields).
    const content = this.el.nativeElement.querySelector('.pia-evaluationBlock-content');
    content.classList.add('show');
    this._evaluationService.checkForFinalValidation(this.evaluation);
  }

  /**
   * Disables action plan field when losing focus from it.
   * Disables inactive evaluation buttons (or does nothing if one has been clicked right after unfocus).
   * Shows evaluation edit button.
   * Saves data from action plan field.
   */
  actionPlanCommentFocusOut() {
    const actionPlanValue = this.evaluationForm.value.actionPlanComment;
    const commentValue = this.evaluationForm.value.evaluationComment;
    let noEvaluationButtonsClicked = true;
    const evaluationButtons: any = document.querySelectorAll('.pia-evaluationBlock-buttons button');

    // Waiting for document.activeElement update
    setTimeout(() => {
      this.evaluation.action_plan_comment = actionPlanValue;
      if (actionPlanValue && actionPlanValue.length > 0 && document.activeElement.id !== 'pia-evaluation-comment') {
        this.evaluationForm.controls['actionPlanComment'].disable();
        evaluationButtons.forEach((btn) => {
          noEvaluationButtonsClicked = (document.activeElement === btn);
        });
        // Disables comment field if both fields are filled and comment isn't the next targeted element.
        if (commentValue && commentValue.length > 0) {
          this.evaluationForm.controls['evaluationComment'].disable();
        }
        if (noEvaluationButtonsClicked || (commentValue && commentValue.length > 0)) {
          this.disableEvaluationButtons();
        }
      }
      // Disables comment field too if no action plan and comment is filled and isn't the next targeted element.
      if (!actionPlanValue && commentValue && commentValue.length > 0 && document.activeElement.id !== 'pia-evaluation-comment') {
        this.evaluationForm.controls['evaluationComment'].disable();
      }
      this.evaluation.update().then(() => {
        this._evaluationService.checkForFinalValidation(this.evaluation);
        this.displayEditButton = true;
      });
    }, 1);
  }

  /**
   * Disables comment field when losing focus from it.
   * Disables inactive evaluation buttons (or does nothing if one has been clicked right after unfocus).
   * Shows evaluation edit button.
   * Saves data from comment field.
   */
  evaluationCommentFocusOut() {
    const actionPlanValue = this.evaluationForm.value.actionPlanComment;
    const commentValue = this.evaluationForm.value.evaluationComment;
    let noEvaluationButtonsClicked = true;
    const evaluationButtons: any = document.querySelectorAll('.pia-evaluationBlock-buttons button');
    // Waiting for document.activeElement update
    setTimeout(() => {
      this.evaluation.evaluation_comment = commentValue;
      if (commentValue && commentValue.length > 0 && document.activeElement.id !== 'pia-evaluation-action-plan') {
        this.evaluationForm.controls['evaluationComment'].disable();
        evaluationButtons.forEach((btn) => {
          if (document.activeElement === btn) {
            noEvaluationButtonsClicked = false;
          }
        });
        // Disables action plan field if both fields are filled and action plan isn't the next targeted element.
        if (actionPlanValue && actionPlanValue.length > 0) {
          this.evaluationForm.controls['actionPlanComment'].disable();
        }
        if (noEvaluationButtonsClicked || ((actionPlanValue && actionPlanValue.length > 0))) {
          this.disableEvaluationButtons();
        }
      }
      // Disables action plan field too if no comment and action plan is filled and isn't the next targeted element.
      if (!commentValue && actionPlanValue && actionPlanValue.length > 0 && document.activeElement.id !== 'pia-evaluation-action-plan') {
        this.evaluationForm.controls['actionPlanComment'].disable();
      }
      this.evaluation.update().then(() => {
        this._evaluationService.checkForFinalValidation(this.evaluation);
        this.displayEditButton = true;
      });
    }, 1);
  }

  checkGaugeChanges(event: any, xOrY: string) {
    const value: string = event.target.value;
    const bgElement = event.target.parentNode.querySelector('.pia-gaugeBlock-background-' + xOrY);
    bgElement.classList.remove('pia-gaugeBlock-background-1');
    bgElement.classList.remove('pia-gaugeBlock-background-2');
    bgElement.classList.remove('pia-gaugeBlock-background-3');
    bgElement.classList.remove('pia-gaugeBlock-background-4');
    bgElement.classList.add('pia-gaugeBlock-background-' + value);
    const gaugeValueX = parseInt(this.evaluationForm.value.gaugeX, 10);
    const gaugeValueY = parseInt(this.evaluationForm.value.gaugeY, 10);
    if (!this.evaluation.gauges) {
      this.evaluation.gauges = {x: 0, y: 0};
    }
    if (gaugeValueX >= 0) {
      this.evaluation.gauges['x'] = gaugeValueX;
    }
    if (gaugeValueY >= 0) {
      this.evaluation.gauges['y'] = gaugeValueY;
    }
    this.evaluation.update().then(() => {
      this._evaluationService.checkForFinalValidation(this.evaluation);
      if (xOrY === 'x') {
        this.evaluationForm.controls['gaugeX'].disable();
        this.displayEditButton = true;
      } else if (xOrY === 'y') {
        this.evaluationForm.controls['gaugeY'].disable();
        this.displayEditButton = true;
      }
    });
  }

  /**
   * Activates evaluation buttons and evaluation fields.
   */
  activateEvaluationEdition() {
    this.enableEvaluationButtons();
    this.evaluationForm.enable();
  }

  /**
   * Disables evaluation buttons except the active one.
   */
  disableEvaluationButtons() {
    const evaluationButtons = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons .btn');
    evaluationButtons.forEach((btn) => {
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
    evaluationButtons.forEach((btn) => {
      btn.removeAttribute('disabled');
    });
  }

  /*autoTextareaResize(event: any, textarea: HTMLElement) {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {

      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height = (textarea.scrollHeight * 2 - textarea.clientHeight) + 'px';
      }
    }
  }*/

}
