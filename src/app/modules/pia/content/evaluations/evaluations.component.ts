import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  AfterViewChecked,
  DoCheck,
  NgZone
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { Answer } from 'src/app/models/answer.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { AnswerService } from 'src/app/services/answer.service';
import { EvaluationService } from 'src/app/services/evaluation.service';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent
  implements OnInit, AfterViewChecked, OnDestroy, DoCheck {
  private placeholderSubscription: Subscription;
  evaluationForm: UntypedFormGroup;
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
  @Input() item: any;
  @Input() pia: any;
  @Input() section: any;
  @Input() questionId: any;
  @Input() measureId: any;
  @Output() evaluationEvent = new EventEmitter<Evaluation>();
  comment_placeholder: string;
  evaluation: Evaluation;
  reference_to: string;
  previousGauges = { x: 0, y: 0 };
  previousReferenceTo: string;
  hasResizedContent = false;
  actionPlanCommentElementId: string;
  evaluationCommentElementId: string;
  editor: any;
  editorEvaluationComment: any;
  loading = false;

  constructor(
    private el: ElementRef,
    public globalEvaluationService: GlobalEvaluationService,
    private ngZone: NgZone,
    private knowledgeBaseService: KnowledgeBaseService,
    private translateService: TranslateService,
    public languagesService: LanguagesService,
    private aswerService: AnswerService,
    private evaluationService: EvaluationService
  ) {}

  async ngOnInit(): Promise<void> {
    // Prefix item
    this.reference_to = this.section.id + '.' + this.item.id;
    this.loading = true;
    this.checkEvaluationValidation().finally(() => {
      this.loading = false;
    });

    // Updating translations when changing language (comments' placeholders)
    this.placeholderSubscription = this.translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        if (this.evaluation && this.evaluation.status) {
          if (this.evaluation.status === 1) {
            this.comment_placeholder = this.translateService.instant(
              'evaluations.placeholder_to_correct'
            );
          } else if (this.evaluation.status === 3) {
            this.comment_placeholder = this.translateService.instant(
              'evaluations.placeholder_acceptable'
            );
          } else {
            this.comment_placeholder = this.translateService.instant(
              'evaluations.placeholder_improvable2'
            );
          }
        }
      }
    );
  }

  ngAfterViewChecked(): void {
    if (this.evaluation) {
      // Evaluation comment textarea auto resize
      const evaluationCommentTextarea = document.querySelector(
        '.pia-evaluation-comment-' + this.evaluation.id
      );
      if (!this.hasResizedContent && evaluationCommentTextarea) {
        this.hasResizedContent = true;
        if (evaluationCommentTextarea) {
          this.autoTextareaResize(null, evaluationCommentTextarea);
        }
      }
    }
  }

  ngDoCheck(): void {
    // Prefix item
    this.reference_to = this.section.id + '.' + this.item.id;
    if (
      this.item.evaluation_mode === 'item' &&
      this.previousReferenceTo !== this.reference_to
    ) {
      this.previousReferenceTo = this.reference_to;
      this.loading = true;
      this.checkEvaluationValidation().finally(() => {
        this.loading = false;
      });
    }
  }

  ngOnDestroy(): void {
    this.placeholderSubscription.unsubscribe();
    tinymce.remove(this.editor);
    tinymce.remove(this.editorEvaluationComment);
  }

  /**
   * Check the evaluation validation.
   * @private
   */
  private async checkEvaluationValidation(): Promise<any> {
    if (this.item.evaluation_mode === 'question') {
      // Measure evaluation update
      if (this.item.is_measure) {
        this.reference_to += '.' + this.measureId;
      } else {
        // Question evaluation update
        this.reference_to += '.' + this.questionId;
      }
    }
    this.actionPlanCommentElementId =
      'pia-evaluation-action-plan-' + this.reference_to.replace(/\./g, '-');
    this.evaluationCommentElementId =
      'pia-evaluation-comment-' + this.reference_to.replace(/\./g, '-');

    this.evaluationForm = new UntypedFormGroup({
      actionPlanComment: new UntypedFormControl(),
      evaluationComment: new UntypedFormControl(),
      gaugeX: new UntypedFormControl(),
      gaugeY: new UntypedFormControl()
    });

    this.loading = true;
    this.evaluationService
      .getByReference(this.pia.id, this.reference_to)
      .then(evaluation => {
        if (evaluation) {
          this.evaluation = evaluation;
          // Translation for comment's placeholder
          if (this.evaluation.status) {
            if (this.evaluation.status === 1) {
              this.comment_placeholder = this.translateService.instant(
                'evaluations.placeholder_to_correct'
              );
            } else if (this.evaluation.status === 3) {
              this.comment_placeholder = this.translateService.instant(
                'evaluations.placeholder_acceptable'
              );
            } else {
              this.comment_placeholder = this.translateService.instant(
                'evaluations.placeholder_improvable2'
              );
            }
          }

          this.evaluationEvent.emit(this.evaluation);

          if (!this.evaluation.gauges) {
            this.evaluation.gauges = { x: 0, y: 0 };
          }

          this.evaluationForm.controls['actionPlanComment'].patchValue(
            this.evaluation.action_plan_comment
          );
          this.evaluationForm.controls['evaluationComment'].patchValue(
            this.evaluation.evaluation_comment
          );
          if (this.evaluation.gauges) {
            this.evaluationForm.controls['gaugeX'].patchValue(
              this.evaluation.gauges['x']
            );
            this.evaluationForm.controls['gaugeY'].patchValue(
              this.evaluation.gauges['y']
            );
          } else {
            this.evaluationForm.controls['gaugeX'].patchValue(0);
            this.evaluationForm.controls['gaugeY'].patchValue(0);
          }
        }
      })
      .finally(() => {
        this.loading = false;
      });

    if (this.item.questions) {
      const questions: any[] = this.item.questions.filter(question => {
        return question.answer_type === 'gauge';
      });

      this.loading = true;
      for await (const question of questions) {
        this.aswerService
          .getByReferenceAndPia(this.pia.id, question.id)
          .then((answer: Answer) => {
            if (answer && answer.data) {
              this.previousGauges[question.cartography.split('_')[1]] =
                answer.data.gauge;
            }
          });
      }
      this.loading = false;
    }
  }

  /**
   * Auto textearea resize
   * @param {*} event - Any Event.
   * @param {*} [textarea] - Any textarea element.
   */
  autoTextareaResize(event: any, textarea?: any): void {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.style.height =
        textarea.scrollHeight * 2 - textarea.clientHeight + 'px';
    }
  }

  /**
   * Updates evaluation fields according to the selected button.
   * @param {Event} event - Any event.
   * @param {number} status - The status of the evaluation (to be fixed, improvable, acceptable).
   */
  selectedButton(event, status: number): void {
    this.evaluation.global_status = 0;
    this.evaluation.status = status;

    // Action plan comment : hides action plan field + switches its value to comment field + removes its value.
    if (status !== 2) {
      const evaluationPlanValue = this.evaluationForm.controls[
        'actionPlanComment'
      ].value;
      const commentValue = this.evaluationForm.controls['evaluationComment']
        .value;

      // Sets up the adequate placeholder for comment
      if (status === 1) {
        this.comment_placeholder = this.translateService.instant(
          'evaluations.placeholder_to_correct'
        );
      } else {
        this.comment_placeholder = this.translateService.instant(
          'evaluations.placeholder_acceptable'
        );
      }

      // Checks if there is an evaluation comment to concatenate it after the action plan value.
      if (evaluationPlanValue && evaluationPlanValue.length > 0) {
        if (commentValue && commentValue.length > 0) {
          this.evaluationForm.controls['evaluationComment'].setValue(
            evaluationPlanValue + '\n<br>' + commentValue
          );
          this.evaluation.evaluation_comment =
            evaluationPlanValue + '\n<br>' + commentValue;
        } else {
          this.evaluationForm.controls['evaluationComment'].setValue(
            evaluationPlanValue
          );
          this.evaluation.evaluation_comment = evaluationPlanValue;
        }
        this.evaluationForm.controls['actionPlanComment'].setValue('');
        this.evaluation.action_plan_comment = undefined;
      }
    } else {
      this.comment_placeholder = this.translateService.instant(
        'evaluations.placeholder_improvable2'
      );
    }

    this.loading = true;
    this.evaluationService
      .update(this.evaluation)
      .then(() => {
        // Pass the evaluation to the parent component
        this.globalEvaluationService.validate().then(() => {
          this.evaluationEvent.emit(this.evaluation);
          // Displays content (action plan & comment fields).
          const content = this.el.nativeElement.querySelector(
            '.pia-evaluationBlock-content'
          );

          if (content) {
            content.classList.remove('hide');
          }
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  /**
   * Loads editor (if not final validation) on action plan comment focus.
   */
  actionPlanCommentFocusIn(): void {
    if (this.globalEvaluationService.evaluationEditionEnabled) {
      this.knowledgeBaseService.placeholder = this.translateService.instant(
        'evaluations.placeholder_improvable1'
      );
      this.loadEditor('actionPlanComment', true);
    }
  }

  /**
   * Executes actions when losing focus from action plan comment.
   */
  actionPlanCommentFocusOut(): void {
    this.knowledgeBaseService.placeholder = null;
    this.editor = null;
    let userText = this.evaluationForm.controls['actionPlanComment'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.evaluation.action_plan_comment = userText;
    this.evaluationService.update(this.evaluation).then(() => {
      this.ngZone.run(() => {
        this.loading = true;
        this.globalEvaluationService.validate().finally(() => {
          this.loading = false;
        });
      });
    });
  }

  /**
   * Activates (or not) evaluation comment when focusing it.
   */
  evaluationCommentFocusIn(): void {
    if (this.globalEvaluationService.evaluationEditionEnabled) {
      this.knowledgeBaseService.placeholder = this.comment_placeholder;
      this.loadEditor('evaluationComment', true);
    }
  }

  /**
   * Executes actions when losing focus from evaluation comment.
   */
  evaluationCommentFocusOut(): void {
    this.knowledgeBaseService.placeholder = null;
    this.editorEvaluationComment = false;
    let userText = this.evaluationForm.controls['evaluationComment'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.evaluation.evaluation_comment = userText;

    this.evaluation.global_status = 0;
    // this.loading = true;
    this.evaluationService.update(this.evaluation).then(() => {
      this.evaluationEvent.emit(this.evaluation);
      this.ngZone.run(() => {
        // this.loading = true;
        this.globalEvaluationService.validate();
        // .finally(() => {
        //   this.loading = false;
        // });
      });
    });
    // .finally(() => {
    //   this.loading = false;
    // });
  }

  /**
   * Enables 'x' gauge.
   */
  enableGaugeX(): void {
    if (this.globalEvaluationService.evaluationEditionEnabled) {
      this.evaluationForm.controls['gaugeX'].enable();
    } else {
      this.evaluationForm.controls['gaugeX'].disable();
    }
  }

  /**
   * Enables 'y' gauge.
   */
  enableGaugeY(): void {
    if (this.globalEvaluationService.evaluationEditionEnabled) {
      this.evaluationForm.controls['gaugeY'].enable();
    } else {
      this.evaluationForm.controls['gaugeY'].disable();
    }
  }

  /**
   * Check gauge changes.
   * @param {*} event - Any Event.
   * @param {string} xOrY - The current coordinate being processed (x or y).
   */
  checkGaugeChanges(event: any, xOrY: string): void {
    const value: string = event.target.value;
    const bgElement = event.target.parentNode.querySelector(
      '.pia-gaugeBlock-background-' + xOrY
    );
    bgElement.classList.remove('pia-gaugeBlock-background-1');
    bgElement.classList.remove('pia-gaugeBlock-background-2');
    bgElement.classList.remove('pia-gaugeBlock-background-3');
    bgElement.classList.remove('pia-gaugeBlock-background-4');
    bgElement.classList.add('pia-gaugeBlock-background-' + value);
    const gaugeValueX = parseInt(this.evaluationForm.value.gaugeX, 10);
    const gaugeValueY = parseInt(this.evaluationForm.value.gaugeY, 10);
    if (!this.evaluation.gauges) {
      this.evaluation.gauges = { x: 0, y: 0 };
    }
    if (gaugeValueX >= 0) {
      this.evaluation.gauges['x'] = gaugeValueX;
    }
    if (gaugeValueY >= 0) {
      this.evaluation.gauges['y'] = gaugeValueY;
    }

    this.loading = true;
    this.evaluationService
      .update(this.evaluation)
      .then(() => {
        this.loading = true;
        this.globalEvaluationService.validate().finally(() => {
          this.loading = false;
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  /**
   * Loads WYSIWYG editor for action plan comment.
   * @param {any} field - Field to load the editor.
   * @param {boolean} [autofocus=false] - Boolean to autofocus or not.
   */
  loadEditor(field, autofocus = false): void {
    let elementId = this.actionPlanCommentElementId;
    if (field === 'evaluationComment') {
      elementId = this.evaluationCommentElementId;
    }
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block: false,
      autoresize_bottom_margin: 30,
      auto_focus: autofocus ? elementId : '',
      autoresize_min_height: 40,
      selector: '#' + elementId,
      toolbar:
        'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin: false,
      setup: editor => {
        if (field === 'actionPlanComment') {
          this.editor = editor;
        } else {
          this.editorEvaluationComment = editor;
        }
        editor.on('focusout', () => {
          this.evaluationForm.controls[field].patchValue(editor.getContent());
          if (field === 'actionPlanComment') {
            this.actionPlanCommentFocusOut();
            tinymce.remove(this.editor);
          } else {
            this.evaluationCommentFocusOut();
            tinymce.remove(this.editorEvaluationComment);
          }
        });
      }
    });
  }
}
