import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit {
  public commentStatus: boolean;
  public actionPlanStatus: boolean;

  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  /**
   * Executes various functionnalities when evaluating an item/question/section.
   * (displaying edit button, displaying evaluatio content with fields, switch value from action plan field to comment field, ...)
   */
  selectedButton(event) {
    const actionPlan = this.el.nativeElement.querySelector('.pia-evaluationBlock-actionPlan');
    const clickedBtn = event.target || event.srcElement || event.currentTarget;

    // Displays edit button.
    const editBtn = this.el.nativeElement.querySelector('.pia-evaluationBlock-edit');
    editBtn.classList.add('show');

    // Shows action plan field on "improvable" evaluation.
    if (clickedBtn.getAttribute('data-btn-type')) {
      actionPlan.classList.add('show');
    } else {
      // Hides action plan field + switchs its value to comment field + removes the value.
      actionPlan.classList.remove('show');
      const evaluationActionPlanField = <HTMLTextAreaElement>document.getElementById('pia-evaluation-action-plan');
      const evaluationCommentField = <HTMLTextAreaElement>document.getElementById('pia-evaluation-comment');
      if (evaluationActionPlanField.value) {
        evaluationCommentField.value += '\n' + evaluationActionPlanField.value;
        evaluationActionPlanField.value = '';
      }
    }

    // Disables active classes + sets disabled attributes for all evaluation buttons.
    const allBtn = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons .btn');
    [].forEach.call(allBtn, function(btn) {
      btn.classList.remove('btn-active');
      btn.setAttribute('disabled', true);
    });

    // Adds an active class + removes previous disable attribute from current button.
    clickedBtn.classList.add('btn-active');
    clickedBtn.removeAttribute('disabled');

    // Displays content (action plan & comment fields).
    const content = this.el.nativeElement.querySelector('.pia-evaluationBlock-content');
    content.classList.add('show');
  }

  /**
   * Disables comment field when losing focus from it.
   */
  commentFocusOut() {
    this.commentStatus = true;
    // TODO : save data
  }

  /**
   * Disables action plan field when losing focus from it.
   */
  actionPlanFocusOut() {
    this.actionPlanStatus = true;
    // TODO : save data
  }

  /**
   * Enables edition mode : activates buttons and fields.
   */
  activateEdition() {
    // Enables evaluation buttons.
    const buttonsToEnable = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons button');
    [].forEach.call(buttonsToEnable, function(btn) {
      btn.removeAttribute('disabled');
    });

    // Enables evaluation fields.
    this.commentStatus = false;
    this.actionPlanStatus = false;
  }

  onSubmit(f: NgForm) {
    console.log(f.value);
  }

}
