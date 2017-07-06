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

  selectedButton(event) {
    // Elements and current button
    const actionPlan = this.el.nativeElement.querySelector('.pia-evaluationBlock-actionPlan');
    const clickedBtn = event.target || event.srcElement || event.currentTarget;

    // Enable edit button
    const editBtn = this.el.nativeElement.querySelector('.pia-evaluationBlock-edit');
    editBtn.classList.add('show');

    // Show action plan field on "improvable" evaluation
    if (clickedBtn.getAttribute('data-btn-type')) {
      actionPlan.classList.add('show');
    } else {
      // Hide action plan field + switch its value to comment field + remove the value
      actionPlan.classList.remove('show');
      const evaluationActionPlanField = <HTMLTextAreaElement>document.getElementById('pia-evaluation-action-plan');
      const evaluationCommentField = <HTMLTextAreaElement>document.getElementById('pia-evaluation-comment');
      if (evaluationActionPlanField.value) {
        evaluationCommentField.value += '\n' + evaluationActionPlanField.value;
        evaluationActionPlanField.value = '';
      }
    }

    // Disable active classes + set disabled attributes for all evaluation buttons
    const allBtn = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons .btn');
    [].forEach.call(allBtn, function(btn) {
      btn.classList.remove('btn-active');
      btn.setAttribute('disabled', true);
    });

    // Add active class + remove previous disable attribute from current button
    clickedBtn.classList.add('btn-active');
    clickedBtn.removeAttribute('disabled');

    // Display content (fields)
    const content = this.el.nativeElement.querySelector('.pia-evaluationBlock-content');
    content.classList.add('show');
  }

  // Disable comment and actionPlan field when losing focus
  commentFocusOut() {
    this.commentStatus = true;
    // Saving data here
  }
  actionPlanFocusOut() {
    this.actionPlanStatus = true;
    // Saving data here
  }

  // Enable edition on evaluation fields
  activateEdition() {
    // Enable evaluation buttons
    const buttonsToEnable = this.el.nativeElement.querySelectorAll('.pia-evaluationBlock-buttons button');
    [].forEach.call(buttonsToEnable, function(btn) {
      btn.removeAttribute('disabled');
    });

    // Enable evaluation fields
    this.commentStatus = false;
    this.actionPlanStatus = false;
  }

  onSubmit(f: NgForm) {
    console.log(f.value);
  }

}
