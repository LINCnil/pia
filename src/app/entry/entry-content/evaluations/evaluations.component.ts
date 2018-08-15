import { Component, ElementRef, OnInit, OnDestroy, Input, Output, EventEmitter, AfterViewChecked, DoCheck, NgZone } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { Evaluation } from './evaluation.model';
import { Answer } from 'app/entry/entry-content/questions/answer.model';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';
import { KnowledgeBaseService } from '../../knowledge-base/knowledge-base.service';
import { SidStatusService } from 'app/services/sid-status.service';
import { PiaService } from 'app/services/pia.service';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})

export class EvaluationsComponent implements OnInit, AfterViewChecked, OnDestroy, DoCheck {
  private riskSubscription: Subscription;
  private placeholderSubscription: Subscription;
  evaluationForm: FormGroup;
  @Input() item: any;
  @Input() pia: any;
  @Input() section: any;
  @Input() questionId: any;
  @Input() measureId: any;
  @Output() evaluationEvent = new EventEmitter<Evaluation>();
  comment_placeholder: string;
  evaluation: Evaluation;
  reference_to: string;
  previousGauges = {x: 0, y: 0};
  previousReferenceTo: string;
  hasResizedContent = false;
  riskName: any;
  actionPlanCommentElementId: String;
  evaluationCommentElementId: String;
  editor: any;
  editorEvaluationComment: any;

  constructor(private el: ElementRef,
              public _globalEvaluationService: GlobalEvaluationService,
              private _ngZone: NgZone,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _sidStatusService: SidStatusService,
              private _piaService: PiaService,
              private _translateService: TranslateService) { }

  ngOnInit() {
    // Prefix item
    this.reference_to = this.section.id + '.' + this.item.id;
    this.checkEvaluationValidation();

    this.riskName = {value: this._translateService.instant('sections.3.items.' + this.item.id + '.title')};

    // Updating translations when changing language (risks' names)
    this.riskSubscription = this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.riskName = {value: this._translateService.instant('sections.3.items.' + this.item.id + '.title')};
    });

    // Updating translations when changing language (comments' placeholders)
    this.placeholderSubscription = this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.evaluation.status) {
        if (this.evaluation.status === 1) {
          this.comment_placeholder = this._translateService.instant('evaluations.placeholder_to_correct');
        } else if (this.evaluation.status === 3) {
          this.comment_placeholder = this._translateService.instant('evaluations.placeholder_acceptable');
        } else {
          this.comment_placeholder = this._translateService.instant('evaluations.placeholder_improvable2');
        }
      }
    });
  }

  ngAfterViewChecked() {
    // Evaluation comment textarea auto resize
    const evaluationCommentTextarea = document.querySelector('.pia-evaluation-comment-' + this.evaluation.id);
    if (!this.hasResizedContent && evaluationCommentTextarea) {
      this.hasResizedContent = true;
      if (evaluationCommentTextarea) {
        this.autoTextareaResize(null, evaluationCommentTextarea);
      }
    }
  }

  ngDoCheck() {
    // Prefix item
    this.reference_to = this.section.id + '.' + this.item.id;
    if (this.item.evaluation_mode === 'item' && this.previousReferenceTo !== this.reference_to) {
      this.previousReferenceTo = this.reference_to;
      this.checkEvaluationValidation();
    }
  }

  ngOnDestroy() {
    this.riskSubscription.unsubscribe();
    this.placeholderSubscription.unsubscribe();
    tinymce.remove(this.editor);
    tinymce.remove(this.editorEvaluationComment);
  }

  /**
   * Check the evaluation validation.
   * @private
   * @memberof EvaluationsComponent
   */
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

    this.actionPlanCommentElementId = 'pia-evaluation-action-plan-' + this.reference_to.replace(/\./g, '-');
    this.evaluationCommentElementId = 'pia-evaluation-comment-' + this.reference_to.replace(/\./g, '-');

    this.evaluationForm = new FormGroup({
      actionPlanComment: new FormControl(),
      evaluationComment: new FormControl(),
      gaugeX: new FormControl(),
      gaugeY: new FormControl()
    });

    this.evaluation = new Evaluation();
    this.evaluation.getByReference(this.pia.id, this.reference_to).then(() => {

      // Translation for comment's placeholder
      if (this.evaluation.status) {
        if (this.evaluation.status === 1) {
          this.comment_placeholder = this._translateService.instant('evaluations.placeholder_to_correct');
        } else if (this.evaluation.status === 3) {
          this.comment_placeholder = this._translateService.instant('evaluations.placeholder_acceptable');
        } else {
          this.comment_placeholder = this._translateService.instant('evaluations.placeholder_improvable2');
        }
      }

      this.evaluationEvent.emit(this.evaluation);

      if (!this.evaluation.gauges) {
        this.evaluation.gauges = {x: 0, y: 0};
      }

      this.evaluationForm.controls['actionPlanComment'].patchValue(this.evaluation.action_plan_comment);
      this.evaluationForm.controls['evaluationComment'].patchValue(this.evaluation.evaluation_comment);
      if (this.evaluation.gauges) {
        this.evaluationForm.controls['gaugeX'].patchValue(this.evaluation.gauges['x']);
        this.evaluationForm.controls['gaugeY'].patchValue(this.evaluation.gauges['y']);
      } else {
        this.evaluationForm.controls['gaugeX'].patchValue(0);
        this.evaluationForm.controls['gaugeY'].patchValue(0);
      }
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
  }

  /**
   * Auto textearea resize
   * @param {*} event - Any Event.
   * @param {*} [textarea] - Any textarea element.
   * @memberof EvaluationsComponent
   */
  autoTextareaResize(event: any, textarea?: any) {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
        textarea.style.height = (textarea.scrollHeight * 2 - textarea.clientHeight) + 'px';

    }
  }

  /**
   * Updates evaluation fields according to the selected button.
   * @param {Event} event - Any event.
   * @param {number} status - The status of the evaluation (to be fixed, improvable, acceptable).
   * @memberof EvaluationsComponent
   */
  selectedButton(event, status: number) {
    this.evaluation.global_status = 0;
    this.evaluation.status = status;

    // Action plan comment : hides action plan field + switchs its value to comment field + removes its value.
    if (status !== 2) {
      const evaluationPlanValue = this.evaluationForm.controls['actionPlanComment'].value;
      const commentValue = this.evaluationForm.controls['evaluationComment'].value;

      // Sets up the adequate placeholder for comment
      if (status === 1) {
        this.comment_placeholder = this._translateService.instant('evaluations.placeholder_to_correct');
      } else {
        this.comment_placeholder = this._translateService.instant('evaluations.placeholder_acceptable');
      }

      // Checks if there is an evaluation comment to concatenate it after the action plan value.
      if (evaluationPlanValue && evaluationPlanValue.length > 0) {
        if (commentValue && commentValue.length > 0) {
          this.evaluationForm.controls['evaluationComment'].setValue(evaluationPlanValue + '\n<br>' + commentValue);
          this.evaluation.evaluation_comment = evaluationPlanValue + '\n<br>' + commentValue;
        } else {
          this.evaluationForm.controls['evaluationComment'].setValue(evaluationPlanValue);
          this.evaluation.evaluation_comment = evaluationPlanValue;
        }
        this.evaluationForm.controls['actionPlanComment'].setValue('');
        this.evaluation.action_plan_comment = undefined;
      }
    } else {
      this.comment_placeholder = this._translateService.instant('evaluations.placeholder_improvable2');
    }

    this.evaluation.update().then(() => {
      // Pass the evaluation to the parent component
      this.evaluationEvent.emit(this.evaluation);
      this._globalEvaluationService.validate();
    });

    // Displays content (action plan & comment fields).
    const content = this.el.nativeElement.querySelector('.pia-evaluationBlock-content');
    content.classList.remove('hide');
  }

  /**
   * Loads editor (if not final validation) on action plan comment focus.
   * @memberof EvaluationsComponent
   */
  actionPlanCommentFocusIn() {
    if (this._globalEvaluationService.evaluationEditionEnabled) {
      this._knowledgeBaseService.placeholder =  this._translateService.instant('evaluations.placeholder_improvable1');
      this.loadEditor('actionPlanComment', true);
    }
  }

  /**
   * Executes actions when losing focus from action plan comment.
   * @memberof EvaluationsComponent
   */
  actionPlanCommentFocusOut() {
    this._knowledgeBaseService.placeholder = null;
    this.editor = null;
    let userText = this.evaluationForm.controls['actionPlanComment'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.evaluation.action_plan_comment = userText;
    this.evaluation.update().then(() => {
      this._ngZone.run(() => {
        this._globalEvaluationService.validate();
        // this._globalEvaluationService.checkForFinalValidation(this.pia, this.section, this.item);
      });
    });
  }

  /**
   * Activates (or not) evaluation comment when focusing it.
   * @memberof EvaluationsComponent
   */
  evaluationCommentFocusIn() {
    if (this._globalEvaluationService.evaluationEditionEnabled) {
      this._knowledgeBaseService.placeholder = this.comment_placeholder;
      this.loadEditor('evaluationComment', true);
    }

  }

  /**
   * Executes actions when losing focus from evaluation comment.
   * @memberof EvaluationsComponent
   */
  evaluationCommentFocusOut() {
    this._knowledgeBaseService.placeholder = null;
    this.editorEvaluationComment = false;
    let userText = this.evaluationForm.controls['evaluationComment'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.evaluation.evaluation_comment = userText;
    this.evaluation.update().then(() => {
      this._ngZone.run(() => {
        this._globalEvaluationService.validate();
        // this._globalEvaluationService.checkForFinalValidation(this.pia, this.section, this.item);
      });
    });
  }

  /**
   * Enables 'x' gauge.
   * @memberof EvaluationsComponent
   */
  enableGaugeX() {
    if (this._globalEvaluationService.evaluationEditionEnabled) {
      this.evaluationForm.controls['gaugeX'].enable();
    } else {
      this.evaluationForm.controls['gaugeX'].disable();
    }
  }

  /**
   * Enables 'y' gauge.
   * @memberof EvaluationsComponent
   */
  enableGaugeY() {
    if (this._globalEvaluationService.evaluationEditionEnabled) {
      this.evaluationForm.controls['gaugeY'].enable();
    } else {
      this.evaluationForm.controls['gaugeY'].disable();
    }
  }

  /**
   * Check gauge changes.
   * @param {*} event - Any Event.
   * @param {string} xOrY - The current coordinate being processed (x or y).
   * @memberof EvaluationsComponent
   */
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
      this._globalEvaluationService.validate();
      // this._globalEvaluationService.checkForFinalValidation(this.pia, this.section, this.item);
    });
  }

  /**
   * Loads WYSIWYG editor for action plan comment.
   * @param {any} field - Field to load the editor.
   * @param {boolean} [autofocus=false] - Boolean to autofocus or not.
   * @memberof EvaluationsComponent
   */
  loadEditor(field, autofocus = false) {
    let elementId = this.actionPlanCommentElementId;
    if (field === 'evaluationComment') {
      elementId = this.evaluationCommentElementId;
    }
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block : false,
      autoresize_bottom_margin: 30,
      auto_focus: (autofocus ? elementId : ''),
      autoresize_min_height: 40,
      content_style: 'body {background-color:#eee!important;}' ,
      selector: '#' + elementId,
      toolbar: 'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin_url: 'assets/skins/lightgray',
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
      },
    });
  }
}
