import { Component, Input, ElementRef, Renderer2, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalsService } from 'app/modals/modals.service';
import { Measure } from './measure.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss']
})
export class MeasuresComponent implements OnInit, OnDestroy {

  @Input() measure: Measure;
  @Input() item: any;
  @Input() section: any;
  @Input() pia: any;
  editor: any;
  elementId: String;
  evaluation: Evaluation = new Evaluation();
  displayEditButton = false;
  displayDeleteButton = true;
  measureForm: FormGroup;
  measureModel: Measure = new Measure();

  constructor(
    private el: ElementRef,
    private _modalsService: ModalsService,
    private _evaluationService: EvaluationService,
    private _ngZone: NgZone,
    private renderer: Renderer2) { }

  ngOnInit() {
    this.measureForm = new FormGroup({
      measureTitle: new FormControl(),
      measureContent: new FormControl()
    });
    this.measureModel.pia_id = this.pia.id;
    this.measureModel.get(this.measure.id).then(() => {
      this.elementId = 'pia-measure-content-' + this.measure.id;
      if (this.measureModel) {
        this.evaluation.getByReference(this.pia.id, this.measure.id).then(() => {
          this.checkDisplayButtons();
        });
        this.measureForm.controls['measureTitle'].patchValue(this.measureModel.title);
        this.measureForm.controls['measureContent'].patchValue(this.measureModel.content);
        if (this.measureModel.title || this.measureModel.content) {
          this.displayEditButton = true;
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
      this.measureModel.pia_id = this.pia.id;
      if (this.measureForm.value.measureTitle !== undefined) {
        const previousTitle = this.measureModel.title;
        this.measureModel.title = titleValue;
        const userText = titleValue.replace(/^\s+/, '').replace(/\s+$/, '');
        if (userText === '') {
          this.measureModel.title = '';
        }
        if (userText !== '' || this.measureModel.title === '') {
          this.measureModel.update().then(() => {
            this._evaluationService.allowEvaluation();
            // Update tags
            const answer = new Answer();
            answer.getByReferenceAndPia(this.pia.id, 324).then(() => {
              if (answer.data && answer.data.list) {
                const index = answer.data.list.indexOf(previousTitle);
                if (~index) {
                  answer.data.list[index] = this.measureModel.title;
                  answer.update();
                }
              }
            });

            const answer2 = new Answer();
            answer2.getByReferenceAndPia(this.pia.id, 334).then(() => {
              if (answer2.data && answer2.data.list) {
                const index = answer2.data.list.indexOf(previousTitle);
                if (~index) {
                  answer2.data.list[index] = this.measureModel.title;
                  answer2.update();
                }
              }
            });

            const answer3 = new Answer();
            answer3.getByReferenceAndPia(this.pia.id, 344).then(() => {
              if (answer3.data && answer3.data.list) {
                const index = answer3.data.list.indexOf(previousTitle);
                if (~index) {
                  answer3.data.list[index] = this.measureModel.title;
                  answer3.update();
                }
              }
            });
          });
        }
        if (titleValue && titleValue.length > 0 && userText !== ''
            && document.activeElement.id !== 'pia-measure-content-' + this.measureModel.id) {
          this.displayEditButton = true;
          this.measureForm.controls['measureTitle'].disable();
          // Disables content field if both fields are filled and content isn't the next targeted element.
          if (contentValue && contentValue.length > 0) {
            this.measureForm.controls['measureContent'].disable();
          }
        }
        // Disables content field too if no title and content is filled and isn't the next targeted element.
        if (!titleValue && contentValue && contentValue.length > 0 && document.activeElement.id !== 'pia-measure-content') {
          this.displayEditButton = true;
          this.measureForm.controls['measureContent'].disable();
        }
      }
    }, 1);
  }

  /**
   * Disables content field when losing focus from it.
   * Shows measure edit button.
   * Saves data from content field.
   * @param {event} event any event.
   */
  measureContentFocusOut() {
    this.editor = null;
    const titleValue = this.measureForm.value.measureTitle;
    const contentValue = this.measureForm.value.measureContent;

    // Waiting for document.activeElement update
    setTimeout(() => {
      this.measureModel.pia_id = this.pia.id;
      if (this.measureForm.value.measureContent !== undefined) {
        this.measureModel.content = contentValue;
        const userText = contentValue.replace(/^\s+/, '').replace(/\s+$/, '');
        if (userText === '') {
          this.measureModel.content = '';
        }
        if (userText !== '' || this.measureModel.content === '') {
          this.measureModel.update().then(() => {
            this._ngZone.run(() => {
              this._evaluationService.allowEvaluation();
            });
          });
        }
        if (contentValue && contentValue.length > 0 && userText !== ''
            && document.activeElement.id !== 'pia-measure-title-' + this.measureModel.id) {
          this.displayEditButton = true;
          this.measureForm.controls['measureContent'].disable();
          // Disables title field if both fields are filled and title isn't the next targeted element.
          if (titleValue && titleValue.length > 0) {
            this.measureForm.controls['measureTitle'].disable();
          }
        }
        // Disables content field too if no title and content is filled and isn't the next targeted element.
        if (!contentValue && contentValue && titleValue.length > 0 && document.activeElement.id !== 'pia-measure-title') {
          this.displayEditButton = true;
          this.measureForm.controls['measureTitle'].disable();
        }
      }
    }, 1);
  }

  /**
   * Enables or disables edition mode (fields) for measures.
   */
  activateMeasureEdition() {
    this.displayEditButton = false;
    this.measureForm.enable();
    this.loadEditor();
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

  /**
   * Load wysiwyg editor
   */
  measureContentFocusIn() {
    this.loadEditor();
  }

  loadEditor() {
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block : false,
      autoresize_bottom_margin: 20,
      auto_focus: this.elementId,
      autoresize_min_height: 30,
      content_style: 'body {background-color:#eee!important;}' ,
      selector: '#' + this.elementId,
      toolbar: 'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin_url: 'assets/skins/lightgray',
      setup: editor => {
        this.editor = editor;
        editor.on('focusout', () => {
          this.measureForm.controls['measureContent'].patchValue(editor.getContent());
          this.measureContentFocusOut();
          tinymce.remove(this.editor);
        });
      },
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }
}
