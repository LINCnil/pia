import { Component, Input, ElementRef, OnInit, Renderer2, OnDestroy, NgZone } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { KnowledgeBaseService } from '../../knowledge-base/knowledge-base.service';
import { Answer } from './answer.model';
import { Measure } from '../measures/measure.model';
import { ModalsService } from 'app/modals/modals.service';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { GlobalEvaluationService } from '../../../services/global-evaluation.service';

// new imports
import { AnswerModel, EvaluationModel, MeasureModel } from '@api/models';
import { AnswerApi, EvaluationApi, MeasureApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})

export class QuestionsComponent implements OnInit, OnDestroy {
  userMeasures = [];
  @Input() question: any;
  @Input() item: any;
  @Input() section: any;
  @Input() pia: any;
  evaluation: EvaluationModel = new EvaluationModel();
  questionForm: FormGroup;
  answer: AnswerModel = new AnswerModel();
  measure: MeasureModel = new MeasureModel();
  lastSelectedTag: string;
  elementId: String;
  editor: any;

  constructor(private el: ElementRef,
    private _knowledgeBaseService: KnowledgeBaseService,
    private _modalsService: ModalsService,
    private _ngZone: NgZone,
    public _globalEvaluationService: GlobalEvaluationService,
    private renderer: Renderer2,
    private answerApi: AnswerApi,
    private evaluationApi: EvaluationApi,
    private measureApi: MeasureApi,
    private permissionsService: PermissionsService
  ) { }

  async ngOnInit() {
    this._globalEvaluationService.answerEditionEnabled = true;
    this.elementId = 'pia-question-content-' + this.question.id;

    this.questionForm = new FormGroup({
      gauge: new FormControl(0),
      text: new FormControl(),
      list: new FormControl()
    });
    this.answer = await this.answerApi.getByRef(this.pia.id, this.question.id).toPromise();

    if (this.answer && this.answer.data) {
      let evaluationRefTo: string = this.answer.id.toString();
      if (this.item.evaluation_mode === 'item') {
        evaluationRefTo = this.section.id + '.' + this.item.id;
      }

      const theEval: EvaluationModel = await this.evaluationApi.getByRef(this.pia.id, evaluationRefTo).toPromise();
      if (theEval) {
        this.evaluation.fromJson(theEval);
      }

      this.questionForm.controls['gauge'].patchValue(this.answer.data.gauge);
      this.questionForm.controls['text'].patchValue(this.answer.data.text);
      if (this.answer.data.list) {
        const dataList = this.answer.data.list.filter((l) => {
          return (l && l.length > 0);
        })
        this.questionForm.controls['list'].patchValue(dataList);
      }
      if (this.el.nativeElement.querySelector('.pia-gaugeBlock-background')) {
        this.el.nativeElement.querySelector('.pia-gaugeBlock-background').classList.
          add('pia-gaugeBlock-background-' + this.answer.data.gauge);
      }
    }

    this.measure.pia_id = this.pia.id;
    const entries: MeasureModel[] = await this.measureApi.getAll(this.pia.id).toPromise();
    if (entries) {
      entries.forEach(entry => {
        if (entry.title) {
          this.userMeasures.push(entry.title);
        }
      });
    }

  }
  
  ngOnChanges(changes) {
    // only run when property "data" changed
    if (changes['pia']) {
      // console.log(this.pia);
    }
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  /**
   * On evaluation change.
   * @param {any} evaluation - Any Evaluation.
   * @memberof QuestionsComponent
   */
  evaluationChange(evaluation) {
    this.evaluation = evaluation;
  }

  /**
   * Enable the gauge.
   * @memberof QuestionsComponent
   */
  enableGauge() {
    if (this._globalEvaluationService.answerEditionEnabled) {
      this.questionForm.controls['gauge'].enable();
    } else {
      this.questionForm.controls['gauge'].disable();
    }
  }

  /**
   * Check gauge change.
   * @param {*} event - Any Event.
   * @memberof QuestionsComponent
   */
  checkGaugeChanges(event: any) {
    const value: string = event.target.value;
    const bgElement = event.target.parentNode.querySelector('.pia-gaugeBlock-background');
    bgElement.classList.remove('pia-gaugeBlock-background-1');
    bgElement.classList.remove('pia-gaugeBlock-background-2');
    bgElement.classList.remove('pia-gaugeBlock-background-3');
    bgElement.classList.remove('pia-gaugeBlock-background-4');
    bgElement.classList.add('pia-gaugeBlock-background-' + value);
    const gaugeValue = parseInt(this.questionForm.value.gauge, 10);
    if (this.answer && this.answer.id) {
      this.answer.data = { text: this.answer.data.text, gauge: gaugeValue, list: this.answer.data.list };
      this.answerApi.update(this.answer).subscribe((updatedAnswer: AnswerModel) => {
        this.answer = updatedAnswer;
        this._ngZone.run(() => {
          this._globalEvaluationService.validate();
        });
      });
    } else {
      this.answer = new AnswerModel();
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: gaugeValue, list: [] };
      this.answerApi.create(this.answer).subscribe((createdAnswer: AnswerModel) => {
        this.answer = createdAnswer;
        this._ngZone.run(() => {
          this._globalEvaluationService.validate();
        });
      });
    }
  }

  /**
   * Loads WYSIWYG editor.
   * @memberof QuestionsComponent
   */
  questionContentFocusIn() {
    this.permissionsService.hasPermission('CanEditPIA').then((hasPerm: boolean) => {
      if (hasPerm && this._globalEvaluationService.answerEditionEnabled) {
        this.loadEditor();
      }
    });

  }

  /**
   * Disables question field + shows edit button + save data.
   * @memberof QuestionsComponent
   */
  questionContentFocusOut() {
    let userText = this.questionForm.controls['text'].value;
    if (userText && typeof userText === 'string') {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    // update
    if (this.answer) {
      this.answer.data = { text: userText, gauge: this.answer.data.gauge, list: this.answer.data.list };
      this.answerApi.update(this.answer).subscribe((updatedAnswer: AnswerModel) => {
        this.answer = updatedAnswer;
        this._ngZone.run(() => {
          this._globalEvaluationService.validate();
        });
      });
      // create
    } else if (!this.answer && userText !== '') {
      if (this.questionForm.value.text && this.questionForm.value.text.length > 0) {
        this.answer = new AnswerModel();
        this.answer.pia_id = this.pia.id;
        this.answer.reference_to = this.question.id;
        const gaugeValueForCurrentQuestion = this.question.answer_type === 'gauge' ? 0 : null;
        this.answer.data = { text: this.questionForm.value.text, gauge: gaugeValueForCurrentQuestion, list: [] };
        this.answerApi.create(this.answer).subscribe((createdAnswer: AnswerModel) => {
          this.answer = createdAnswer;
          this._ngZone.run(() => {
            this._globalEvaluationService.validate();
          });
        });
      }
    }
  }

  /**
   * Adds the measure tag in the database.
   * @param {any} event - Any Event.
   * @memberof QuestionsComponent
   */
  onAdd(event) {
    if (event && event.value.length > 0) {
      let list = [];
      if (this.answer && this.answer.id) {
        list = this.answer.data.list;
      }
      if (list.indexOf(event.value) <= 0) {
        list.push(event.value);
        this.createOrUpdateList(list);
      }
    }
  }

  /**
   * Updates the last selected tag.
   * @param {any} event - Any Event.
   * @memberof QuestionsComponent
   */
  onSelected(event) {
    // When it returns an object (weird scenario)
    if (event.hasOwnProperty('value')) {
      this.lastSelectedTag = event.value;
    } else {
      this.lastSelectedTag = event;
    }
  }

  /**
   * Removes the measure tag from the database.
   * @param {any} event - Any Event.
   * @memberof QuestionsComponent
   */
  onRemove(event) {
    let list = [];
    if (this.answer) {
      list = this.answer.data.list;
    }
    let valueToRemove;
    if (event.hasOwnProperty('value')) {
      valueToRemove = event.value;
    } else {
      valueToRemove = event;
    }
    const index = list.indexOf(valueToRemove);
    if (index >= 0) {
      list.splice(list.indexOf(valueToRemove), 1);
      this.createOrUpdateList(list);
    }
  }

  /**
   * On tag edited.
   * @param {any} event - Any Event.
   * @memberof QuestionsComponent
   */
  onTagEdited(event) {
    let list = [];
    if (this.answer) {
      list = this.answer.data.list;
    }
    const index = list.indexOf(this.lastSelectedTag);
    let updatedValue;
    // When it returns an object (weird scenario)
    if (event.hasOwnProperty('value')) {
      updatedValue = event.value;
    } else {
      updatedValue = event;
    }
    list[index] = updatedValue;
    this.createOrUpdateList(list);
  }

  /**
   * On tag leave.
   * @param {any} event - Any Event.
   * @memberof QuestionsComponent
   */
  onBlur(event) {
    if (event && event.length > 0) {
      let list = [];
      if (this.answer) {
        list = this.answer.data.list;
      }
      if (list.indexOf(event) <= 0) {
        list.push(event);
        this.createOrUpdateList(list);
      }
    }
  }

  /**
   * Creates or updates the tags list.
   * @private
   * @param {string[]} list - List of tags.
   * @memberof QuestionsComponent
   */
  private createOrUpdateList(list: string[]) {
    if (this.answer) {
      this.answer.data = { text: this.answer.data.text, gauge: this.answer.data.gauge, list: list };

      this.answerApi.update(this.answer).subscribe((updatedAnswer: AnswerModel) => {
        this.answer = updatedAnswer;
        this._globalEvaluationService.validate();
      });
    } else {
      this.answer = new AnswerModel();
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: null, list: list };
      this.answerApi.create(this.answer).subscribe((updatedAnswer: AnswerModel) => {
        this.answer = updatedAnswer;
        this._globalEvaluationService.validate();
      });
    }
  }

  /**
   * Shows or hides a question.
   * @param {*} event - Any Event.
   * @memberof QuestionsComponent
   */
  displayQuestion(event: any) {
    const accordeon = this.el.nativeElement.querySelector('.pia-accordeon');
    accordeon.classList.toggle('fa-angle-down');
    const displayer = this.el.nativeElement.querySelector('.pia-questionBlock-displayer');
    displayer.classList.toggle('close');

    // Display comments/evaluations for questions
    const commentsDisplayer = document.querySelector('.pia-commentsBlock-question-' + this.question.id);
    const evaluationDisplayer = document.querySelector('.pia-evaluationBlock-question-' + this.question.id);
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
   * Loads wysiwyg editor.
   * @memberof QuestionsComponent
   */
  loadEditor() {
    this._knowledgeBaseService.placeholder = this.question.placeholder;
    this._knowledgeBaseService.search('', '', this.question.link_knowledge_base);
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block: false,
      autoresize_bottom_margin: 30,
      auto_focus: this.elementId,
      autoresize_min_height: 40,
      content_style: 'body {background-color:#eee!important;}',
      selector: '#' + this.elementId,
      toolbar: 'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin_url: 'assets/skins/lightgray',
      setup: editor => {
        this.editor = editor;
        editor.on('focusout', () => {
          this.questionForm.controls['text'].patchValue(editor.getContent());
          this.questionContentFocusOut();
          this.closeEditor();
        });
      },
    });
  }

  /**
   * Close the editor.
   * @private
   * @memberof QuestionsComponent
   */
  private closeEditor() {
    this._knowledgeBaseService.placeholder = null;
    tinymce.remove(this.editor);
    this.editor = null;
  }

  protected checkPermissions() {
    
  }
}
