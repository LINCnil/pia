import { Component, Input, ElementRef, Renderer2, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalsService } from 'app/modals/modals.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

import { EvaluationModel, AnswerModel, MeasureModel } from '@api/models';
import { EvaluationApi, AnswerApi, MeasureApi } from '@api/services';

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss']
})
export class MeasuresComponent implements OnInit, OnDestroy {

  @Input() measure: MeasureModel;
  @Input() item: any;
  @Input() section: any;
  @Input() pia: any;
  editor: any;
  elementId: string;
  evaluation: EvaluationModel = new EvaluationModel();
  displayDeleteButton = true;
  measureForm: FormGroup;
  measureModel: MeasureModel = new MeasureModel();

  constructor(
    public _globalEvaluationService: GlobalEvaluationService,
    private el: ElementRef,
    private _modalsService: ModalsService,
    private _knowledgeBaseService: KnowledgeBaseService,
    private _ngZone: NgZone,
    private renderer: Renderer2,
    private evaluationApi: EvaluationApi,
    private answerApi: AnswerApi,
  private measureApi: MeasureApi) { }

  ngOnInit() {
    this.measureForm = new FormGroup({
      measureTitle: new FormControl(),
      measureContent: new FormControl()
    });

    this.measureApi.get(this.pia.id, this.measure.id).subscribe((theMeasure: MeasureModel) => {
      this.measureModel.fromJson(theMeasure);
      this._knowledgeBaseService.toHide.push(this.measure.title);
      this.elementId = 'pia-measure-content-' + this.measure.id;
      if (this.measureModel !== null) {
        this.measureForm.controls['measureTitle'].patchValue(this.measureModel.title);
        this.measureForm.controls['measureContent'].patchValue(this.measureModel.content);
        if (this.measureModel.title) {
          this.measureForm.controls['measureTitle'].disable();
        }
      }

      const measureTitleTextarea = document.getElementById('pia-measure-title-' + this.measure.id);
      if (measureTitleTextarea) {
        this.autoTextareaResize(null, measureTitleTextarea);
      }
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  /**
   * Enable auto resizing on measure title textarea.
   * @param {*} event - Any Event.
   * @param {HTMLElement} textarea - Any textarea.
   * @memberof MeasuresComponent
   */
  autoTextareaResize(event: any, textarea?: HTMLElement) {
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

  /**
   * Change evaluation.
   * @param {*} evaluation - Any Evaluation.
   * @memberof MeasuresComponent
   */
  evaluationChange(evaluation: any) {
    this.evaluation = evaluation;
  }

  /**
   * Enables edition for measure title.
   * @memberof MeasuresComponent
   */
  measureTitleFocusIn() {
    if (this._globalEvaluationService.answerEditionEnabled) {
      this.measureForm.controls['measureTitle'].enable();
      const measureTitleTextarea = document.getElementById('pia-measure-title-' + this.measure.id);
      measureTitleTextarea.focus();
    }
  }

  /**
   * Disables title field when losing focus from it.
   * Shows measure edit button.
   * Saves data from title field.
   * @param {event} event - Any Event.
   * @memberof MeasuresComponent
   */
  measureTitleFocusOut(event: Event) {
    let userText = this.measureForm.controls['measureTitle'].value;
    if (userText && typeof userText === 'string') {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.measureModel.pia_id = this.pia.id;
    const previousTitle = this.measureModel.title;
    this.measureModel.title = userText;
    this.measureApi.update(this.measureModel).subscribe((updatedMeasure: MeasureModel) => {
      this.measureModel.fromJson(updatedMeasure);
      if (previousTitle !== this.measureModel.title) {
        this._knowledgeBaseService.removeItemIfPresent(this.measureModel.title, previousTitle);
      }

      // Update tags
      this.answerApi.getByRef(this.pia.id, 324).subscribe((theAnswer: AnswerModel) => {
        if (theAnswer && theAnswer.data && theAnswer.data.list) {
          const index = theAnswer.data.list.indexOf(previousTitle);
          if (~index) {
            theAnswer.data.list[index] = this.measureModel.title;
            this.answerApi.update(theAnswer).subscribe();
          }
        }
      });

      this.answerApi.getByRef(this.pia.id, 334).subscribe((theAnswer2: AnswerModel) => {
        if (theAnswer2 && theAnswer2.data && theAnswer2.data.list) {
          const index = theAnswer2.data.list.indexOf(previousTitle);
          if (~index) {
            theAnswer2.data.list[index] = this.measureModel.title;
            this.answerApi.update(theAnswer2).subscribe();
          }
        }
      });

      this.answerApi.getByRef(this.pia.id, 344).subscribe((theAnswer3: AnswerModel) => {
        if (theAnswer3 && theAnswer3.data && theAnswer3.data.list) {
          const index = theAnswer3.data.list.indexOf(previousTitle);
          if (~index) {
            theAnswer3.data.list[index] = this.measureModel.title;
            this.answerApi.update(theAnswer3).subscribe();
          }
        }
      });


      if (this.measureForm.value.measureTitle && this.measureForm.value.measureTitle.length > 0) {
        this.measureForm.controls['measureTitle'].disable();
      }

      this._globalEvaluationService.validate();
    });

  }

  /**
   * Loads WYSIWYG editor for measure answer.
   * @memberof MeasuresComponent
   */
  measureContentFocusIn() {
    if (this._globalEvaluationService.answerEditionEnabled) {
      this.loadEditor();
    }
  }

  /**
   * Disables content field when losing focus from it.
   * Shows measure edit button.
   * Saves data from content field.
   * @memberof MeasuresComponent
   */
  measureContentFocusOut() {
    this._knowledgeBaseService.placeholder = null;
    this.editor = null;
    let userText = this.measureForm.controls['measureContent'].value;
    if (userText && typeof userText === 'string') {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.measureModel.pia_id = this.pia.id;
    this.measureModel.content = userText;
    this.measureApi.update(this.measureModel).subscribe((updatedMeasure: MeasureModel) => {
      this.measureModel.fromJson(updatedMeasure);
      this._ngZone.run(() => {
        this._globalEvaluationService.validate();
      });
    });
  }

  /**
   * Shows or hides a measure.
   * @param {*} event - Any Event.
   * @memberof MeasuresComponent
   */
  displayMeasure(event: any) {
    const accordeon = this.el.nativeElement.querySelector('.pia-measureBlock-title button');
    accordeon.classList.toggle('fa-angle-up');
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
   * @param {string} measureId - A measure id.
   * @memberof MeasuresComponent
   */
  removeMeasure(measureId: string) {
    const measuresCount = document.querySelectorAll('.pia-measureBlock');
    if (measuresCount && measuresCount.length <= 1) {
      this._modalsService.openModal('not-enough-measures-to-remove');
    } else {
      localStorage.setItem('measure-id', measureId);
      this._modalsService.openModal('remove-measure');
    }
  }

  /**
   * Loads wysiwyg editor.
   * @memberof MeasuresComponent
   */
  loadEditor() {
    this._knowledgeBaseService.placeholder = this.measure.placeholder;
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block : false,
      autoresize_bottom_margin: 30,
      auto_focus: this.elementId,
      autoresize_min_height: 40,
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
}
