import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  NgZone,
  Output,
  EventEmitter
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { Answer } from 'src/app/models/answer.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { Measure } from 'src/app/models/measure.model';
import { AnswerService } from 'src/app/services/answer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MeasureService } from 'src/app/services/measures.service';
import { Pia } from '../../../../models/pia.model';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss']
})
export class MeasuresComponent implements OnInit, OnDestroy {
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
  @Input() measure: Measure;
  @Input() item: any;
  @Input() section: any;
  @Input() pia: any;
  @Output() deleted = new EventEmitter();
  editor: any;
  elementId: string;
  evaluation: Evaluation = new Evaluation();
  displayDeleteButton = true;
  measureForm: UntypedFormGroup;
  measureModel: Measure = new Measure();
  editTitle = true;
  loading = false;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    public globalEvaluationService: GlobalEvaluationService,
    private dialogService: DialogService,
    private el: ElementRef,
    private knowledgeBaseService: KnowledgeBaseService,
    private answerService: AnswerService,
    private measuresService: MeasureService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.measureForm = new UntypedFormGroup({
      measureTitle: new UntypedFormControl(),
      measureContent: new UntypedFormControl()
    });
    this.measureModel.pia_id = this.pia.id;
    this.loading = true;
    this.measuresService
      .find(this.measure.id)
      .then((entry: Measure) => {
        this.measureModel = entry;
        this.knowledgeBaseService.toHide.push(this.measure.title);
        this.elementId = 'pia-measure-content-' + this.measure.id;
        if (this.measureModel) {
          this.measureForm.controls['measureTitle'].patchValue(
            this.measureModel.title
          );
          this.measureForm.controls['measureContent'].patchValue(
            this.measureModel.content
          );
          if (this.measureModel.title) {
            this.measureForm.controls['measureTitle'].disable();
            this.editTitle = false;
          }
        }

        const measureTitleTextarea = document.getElementById(
          'pia-measure-title-' + this.measure.id
        );
        if (measureTitleTextarea) {
          this.autoTextareaResize(null, measureTitleTextarea);
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    tinymce.remove(this.editor);
  }

  /**
   * Enable auto resizing on measure title textarea.
   * @param event - Any Event.
   * @param textarea - Any textarea.
   */
  autoTextareaResize(event: any, textarea?: HTMLElement): void {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height =
          textarea.scrollHeight * 2 - textarea.clientHeight + 'px';
      }
    }
  }

  /**
   * Change evaluation.
   * @param evaluation - Any Evaluation.
   */
  evaluationChange(evaluation: any): void {
    this.evaluation = evaluation;
  }

  /**
   * Enables edition for measure title.
   */
  measureTitleFocusIn(): void {
    if (this.globalEvaluationService.answerEditionEnabled) {
      this.editTitle = true;
      this.measureForm.controls['measureTitle'].enable();
      const measureTitleTextarea = document.getElementById(
        'pia-measure-title-' + this.measure.id
      );
      setTimeout(() => {
        measureTitleTextarea.focus();
      }, 200);
    }
  }

  /**
   * Disables title field when losing focus from it.
   * Shows measure edit button.
   * Saves data from title field.
   * @param event - Any Event.
   */
  measureTitleFocusOut(event: Event): void {
    let userText = this.measureForm.controls['measureTitle'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
      this.editTitle = false;
    }
    this.measureModel.pia_id = this.pia.id;
    const previousTitle = this.measureModel.title;
    this.measureModel.title = userText;
    this.measuresService
      .update(this.measureModel)
      .then((response: Measure) => {
        this.measureModel.lock_version = response.lock_version;
        if (previousTitle !== this.measureModel.title) {
          this.knowledgeBaseService.removeItemIfPresent(
            this.measureModel.title,
            previousTitle
          );
        }

        // Update tags
        this.answerService
          .getByReferenceAndPia(this.pia.id, 324)
          .then((answer: Answer) => {
            if (answer && answer.data && answer.data.list) {
              const index = answer.data.list.indexOf(previousTitle);
              if (index !== -1) {
                answer.data.list[index] = this.measureModel.title;
                this.answerService.update(answer);
              }
            }
          });

        this.answerService
          .getByReferenceAndPia(this.pia.id, 334)
          .then((answer: Answer) => {
            if (answer && answer.data && answer.data.list) {
              const index = answer.data.list.indexOf(previousTitle);
              if (index !== -1) {
                answer.data.list[index] = this.measureModel.title;
                this.answerService.update(answer);
              }
            }
          });

        this.answerService
          .getByReferenceAndPia(this.pia.id, 344)
          .then((answer: Answer) => {
            if (answer && answer.data && answer.data.list) {
              const index = answer.data.list.indexOf(previousTitle);
              if (index !== -1) {
                answer.data.list[index] = this.measureModel.title;
                this.answerService.update(answer);
              }
            }
          });

        if (
          this.measureForm.value.measureTitle &&
          this.measureForm.value.measureTitle.length > 0
        ) {
          this.measureForm.controls['measureTitle'].disable();
        }

        this.globalEvaluationService.validate();
      })
      .catch(err => {
        if (err.statusText === 'Conflict') {
          this.conflictDialog('title', err);
        }
      });
  }

  /**
   * Loads WYSIWYG editor for measure answer.
   */
  measureContentFocusIn(): void {
    if (this.globalEvaluationService.answerEditionEnabled) {
      this.loadEditor();
    }
  }

  /**
   * Disables content field when losing focus from it.
   * Shows measure edit button.
   * Saves data from content field.
   */
  measureContentFocusOut(): void {
    this.knowledgeBaseService.placeholder = null;
    this.editor = null;
    let userText = this.measureForm.controls['measureContent'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.measureModel.pia_id = this.pia.id;
    this.measureModel.content = userText;
    this.measuresService
      .update(this.measureModel)
      .then((response: Measure) => {
        this.measureModel.lock_version = response.lock_version;
        this.ngZone.run(() => {
          this.globalEvaluationService.validate();
        });
      })
      .catch(err => {
        if (err.statusText === 'Conflict') {
          this.conflictDialog('content', err);
        }
      });
  }

  /**
   * Shows or hides a measure.
   * @param event - Any Event.
   */
  displayMeasure(event: any): void {
    const accordion = this.el.nativeElement.querySelector(
      '.pia-measureBlock-title button'
    );
    accordion.classList.toggle('pia-icon-accordion-down');
    const displayer = this.el.nativeElement.querySelector(
      '.pia-measureBlock-displayer'
    );
    displayer.classList.toggle('close');

    // Display comments/evaluations for measures
    const commentsDisplayer = document.querySelector(
      '.pia-commentsBlock-measure-' + this.measure.id
    );
    const evaluationDisplayer = document.querySelector(
      '.pia-evaluationBlock-measure-' + this.measure.id
    );
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
   * @param measureId - A measure id.
   */
  removeMeasure(measureId: string): void {
    const measuresCount = document.querySelectorAll('.pia-measureBlock');
    if (measuresCount && measuresCount.length <= 1) {
      this.dialogService.confirmThis(
        {
          text: 'modals.not_enough_measures_to_remove.content',
          type: 'yes',
          yes: 'modals.close',
          no: '',
          icon: 'pia-icons pia-icon-sorry',
          data: {
            btn_yes: 'btn-blue'
          }
        },
        () => {
          return false;
        },
        () => {
          return false;
        }
      );
    } else {
      this.dialogService.confirmThis(
        {
          text: 'modals.remove_measure.content',
          type: 'confirm',
          yes: 'modals.remove_measure.remove',
          no: 'modals.remove_measure.keep',
          icon: 'pia-icons pia-icon-sad',
          data: {
            btn_yes: 'btn-red'
          }
        },
        () => {
          this.measuresService.removeMeasure(measureId).then(() => {
            this.deleted.emit(measureId);
          });
        },
        () => {
          return;
        }
      );
    }
  }

  /**
   * Loads wysiwyg editor.
   */
  loadEditor(): void {
    this.knowledgeBaseService.placeholder = this.measure.placeholder;
    setTimeout(() => {
      tinymce.init({
        branding: false,
        menubar: false,
        statusbar: false,
        plugins: 'autoresize lists',
        forced_root_block: false,
        autoresize_bottom_margin: 30,
        auto_focus: this.elementId,
        autoresize_min_height: 40,
        selector: '#' + this.elementId,
        toolbar:
          'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
        skin: false,
        setup: editor => {
          this.editor = editor;
          editor.on('focusout', async () => {
            this.measureForm.controls['measureContent'].patchValue(
              editor.getContent()
            );
            await this.measureContentFocusOut();
            tinymce.remove(this.editor);
          });
        }
      });
    }, 100);
  }

  /**
   * Open a dialog modal for deal with the conflict
   * @param err
   */
  conflictDialog(field, error) {
    let additional_text: string;
    const currentUrl = this.router.url;
    // Text
    additional_text = `
      ${this.translateService.instant('conflict.pia_field_name')}:
      ${field}
      <br>
      ${this.translateService.instant('conflict.initial_content')}:
      ${error.record[field]}
      <br>
      ${this.translateService.instant('conflict.new_content')}:
      ${error.params[field]}
    `;

    // Open dialog here
    this.dialogService.confirmThis(
      {
        text: this.translateService.instant('conflict.title'),
        type: 'others',
        yes: '',
        no: '',
        icon: 'pia-icons pia-icon-sad',
        data: {
          no_cross_button: true,
          btn_no: false,
          additional_text
        }
      },
      () => {
        return;
      },
      () => {
        return;
      },
      [
        {
          label: this.translateService.instant('conflict.keep_initial'),
          callback: () => {
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate([currentUrl]);
              });
            return;
          }
        },
        {
          label: this.translateService.instant('conflict.keep_new'),
          callback: () => {
            let newMeasureFixed: Measure = { ...error.params };
            newMeasureFixed.id = error.record.id;
            newMeasureFixed.lock_version = error.record.lock_version;
            this.measuresService.update(newMeasureFixed).then(() => {
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([currentUrl]);
                });
              return;
            });
          }
        },
        {
          label: this.translateService.instant('conflict.merge'),
          callback: () => {
            let newMeasureFixed: Measure = { ...error.record };
            let separator = field === 'title' ? ' ' : '\n';
            newMeasureFixed[field] += separator + error.params[field];
            this.measuresService.update(newMeasureFixed).then(() => {
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([currentUrl]);
                });
              return;
            });
          }
        }
      ]
    );
  }
}
