import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.scss']
})
export class ActionPlanComponent implements OnInit {

  @Input() pia: any;
  @Input() data: any;
  risks = [];
  measures = [];
  results = [];
  evaluationModel: Evaluation = new Evaluation();
  actionPlanForm: FormGroup;
  noMeasuresActionPlan = true;
  noRisksActionPlan = true;

  constructor(private el: ElementRef, private _piaService: PiaService) { }

  ngOnInit() {
    this.actionPlanForm = new FormGroup({
      actionPlanDate: new FormControl(),
      actionPlanExecutive: new FormControl()
    });
    this._piaService.getPIA().then(() => {
      const date = this.pia.action_plan_date;
      let month = date.getMonth() + 1;
      if (month.toString.length === 1) {
        month = '0' + month;
      }
      const finalDate =  date.getFullYear() + '-' + month + '-' + date.getDate();
      this.actionPlanForm.controls['actionPlanDate'].patchValue(finalDate);
      this.actionPlanForm.controls['actionPlanExecutive'].patchValue(this.pia.action_plan_executive);
    });

    const section = this.data.sections.filter((s) => {
      return s.id === 2;
    });
    section[0].items.forEach((item) => {
      item.questions.forEach(q => {
        const evaluation = new Evaluation();
        const reference_to = '2.' + item.id + '.' + q.id;
        this.results[reference_to] = null;
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.status > 0) {
            this.results[reference_to] = evaluation.status;
          }
        });
      });
    });

    const measure = new Measure();
    measure.pia_id = this.pia.id;
    measure.findAll().then((entries: any) => {
      entries.forEach(m => {
        const evaluation = new Evaluation();
        const reference_to = '3.1.' + m.id;
        this.measures[reference_to] = null;
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.status > 0) {
            if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
              this.noMeasuresActionPlan = false;
            }
            this.measures.push({ name: m.title, status: evaluation.status, action_plan_comment: evaluation.action_plan_comment });
          }
        });
      });
    });

    const evaluation = new Evaluation();
    evaluation.getByReference(this.pia.id, '3.2').then(() => {
      if (evaluation.status > 0) {
        if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
          this.noRisksActionPlan = false;
        }
        this.risks['3.2'] = { status: evaluation.status, action_plan_comment: evaluation.action_plan_comment };
      }
    });

    const evaluation2 = new Evaluation();
    evaluation2.getByReference(this.pia.id, '3.3').then(() => {
      if (evaluation2.status > 0) {
        if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
          this.noRisksActionPlan = false;
        }
        this.risks['3.3'] = { status: evaluation2.status, action_plan_comment: evaluation2.action_plan_comment };
      }
    });

    const evaluation3 = new Evaluation();
    evaluation3.getByReference(this.pia.id, '3.4').then(() => {
      if (evaluation3.status > 0) {
        if (evaluation.action_plan_comment && evaluation.action_plan_comment.length > 0) {
          this.noRisksActionPlan = false;
        }
        this.risks['3.4'] = { status: evaluation3.status, action_plan_comment: evaluation3.action_plan_comment };
      }
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
