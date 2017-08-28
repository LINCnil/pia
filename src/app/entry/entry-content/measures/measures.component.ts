import { Component, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalsService } from 'app/modals/modals.service';
import { Measure } from './measure.model';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss']
})
export class MeasuresComponent implements OnInit {

  @Input() measure: Measure;
  @Input() item: any;
  @Input() section: any;
  @Input() pia: any;
  evaluation: Evaluation = new Evaluation();
  displayEditButton = false;
  displayDeleteButton = false;
  measureForm: FormGroup;
  measureModel: Measure = new Measure();

  constructor(
    private el: ElementRef,
    private _modalsService: ModalsService,
    private _evaluationService: EvaluationService,
    private renderer: Renderer2) { }

  ngOnInit() {
    this.measureForm = new FormGroup({
      measureTitle: new FormControl(),
      measureContent: new FormControl()
    });
    this.measureModel.get(this.measure.id).then(() => {
      if (this.measureModel) {
        this.evaluation.getByReference(this.pia.id, this.measure.id).then(() => {
          this.checkDisplayButtons();
        });
        this.measureForm.controls['measureTitle'].patchValue(this.measureModel.title);
        this.measureForm.controls['measureContent'].patchValue(this.measureModel.content);
        if (this.measureModel.title || this.measureModel.content) {
          this.displayEditButton = true;
          this.displayDeleteButton = true;
        }
        if (this.measureModel.title) {
          this.measureForm.controls['measureTitle'].disable();
        }
        if (this.measureModel.content) {
          this.measureForm.controls['measureContent'].disable();
        }
      }
      const measureTitleTextarea = document.getElementById('pia-measure-title-' + this.measure.id);
      if (measureTitleTextarea) {
        this.autoTextareaResize(null, measureTitleTextarea);
      }
      const measureContentTextarea = document.getElementById('pia-measure-content-' + this.measure.id);
      if (measureContentTextarea) {
        this.autoTextareaResize(null, measureContentTextarea);
      }
    });
  }

  autoTextareaResize(event: any, textarea: HTMLElement) {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height = (textarea.scrollHeight * 2 - textarea.clientHeight) + 'px';
      }
    }
  }

  evaluationChange(evaluation) {
    this.evaluation = evaluation;
    this.checkDisplayButtons();
  }

  checkDisplayButtons() {
    if (this._evaluationService.showValidationButton) {
      this.displayEditButton = false;
      this.displayDeleteButton = false;
    }
    if (this._evaluationService.enableFinalValidation) {
      this.displayEditButton = false;
      this.displayDeleteButton = false;
    }
    if (this.evaluation && this.evaluation.status === 1) {
      this.displayEditButton = true;
      this.displayDeleteButton = true;
    }
  }

  /**
   * Disables title field when losing focus from it.
   * Shows measure edit button.
   * Saves data from title field.
   * @param {event} event any event.
   */
  measureTitleFocusOut(event) {
    const titleValue = this.measureForm.value.measureTitle;
    const contentValue = this.measureForm.value.measureContent;

    // Waiting for document.activeElement update
    setTimeout(() => {
      this.measureModel.title = titleValue;
      this.measureModel.update().then(() => {
        this._evaluationService.allowEvaluation();
      });
      if (titleValue && titleValue.length > 0 && document.activeElement.id !== 'pia-measure-content-' + this.measureModel.id) {
        this.displayEditButton = true;
        this.displayDeleteButton = true;
        this.measureForm.controls['measureTitle'].disable();
        // Disables content field if both fields are filled and content isn't the next targeted element.
        if (contentValue && contentValue.length > 0) {
          this.measureForm.controls['measureContent'].disable();
        }
      }
      // Disables content field too if no title and content is filled and isn't the next targeted element.
      if (!titleValue && contentValue && contentValue.length > 0 && document.activeElement.id !== 'pia-measure-content') {
        this.displayEditButton = true;
        this.displayDeleteButton = true;
        this.measureForm.controls['measureContent'].disable();
      }
    }, 1);
  }

  /**
   * Disables content field when losing focus from it.
   * Shows measure edit button.
   * Saves data from content field.
   * @param {event} event any event.
   */
  measureContentFocusOut(event) {
    const titleValue = this.measureForm.value.measureTitle;
    const contentValue = this.measureForm.value.measureContent;

    // Waiting for document.activeElement update
    setTimeout(() => {
      this.measureModel.content = contentValue;
      this.measureModel.update().then(() => {
        this._evaluationService.allowEvaluation();
      });
      if (contentValue && contentValue.length > 0 && document.activeElement.id !== 'pia-measure-title-' + this.measureModel.id) {
        this.displayEditButton = true;
        this.displayDeleteButton = true;
        this.measureForm.controls['measureContent'].disable();
        // Disables title field if both fields are filled and title isn't the next targeted element.
        if (titleValue && titleValue.length > 0) {
          this.measureForm.controls['measureTitle'].disable();
        }
      }
      // Disables content field too if no title and content is filled and isn't the next targeted element.
      if (!contentValue && contentValue && titleValue.length > 0 && document.activeElement.id !== 'pia-measure-title') {
        this.displayEditButton = true;
        this.displayDeleteButton = true;
        this.measureForm.controls['measureTitle'].disable();
      }
    }, 1);
  }

  /**
   * Enables or disables edition mode (fields) for measures.
   */
  activateMeasureEdition() {
    this.displayEditButton = false;
    this.measureForm.enable();
  }

  /**
   * Shows or hides a measure.
   */
  displayMeasure(event: any) {
    const accordeon = this.el.nativeElement.querySelector('.pia-measureBlock-title button');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector('.pia-measureBlock-displayer');
    displayer.classList.toggle('close');

    // Display comments/evaluations for measures
    const commentsDisplayer = document.querySelector('.pia-commentsBlock-measure-' + this.measure.id);
    const evaluationDisplayer = document.querySelector('.pia-evaluationBlock-measure-' + this.measure.id);
    if (event.target.getAttribute('data-status') === 'hide') {
      event.target.removeAttribute('data-status');
      commentsDisplayer.classList.remove('hide');
      if (evaluationDisplayer && this.evaluation.status > 0) {
        evaluationDisplayer.classList.remove('hide');
      }
    } else {
      event.target.setAttribute('data-status', 'hide');
      commentsDisplayer.classList.add('hide');
      if (evaluationDisplayer) {
        evaluationDisplayer.classList.add('hide');
      }
    }
  }

  /**
   * Allows an user to remove a measure.
   */
  removeMeasure(measureID: string) {
    const measuresCount = document.querySelectorAll('.pia-measureBlock');
    if (measuresCount && measuresCount.length <= 1) {
      this._modalsService.openModal('not-enough-measures-to-remove');
    } else {
      localStorage.setItem('measure-id', measureID);
      this._modalsService.openModal('remove-measure');
    }
  }

}
