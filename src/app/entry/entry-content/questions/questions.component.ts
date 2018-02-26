import { Component, Input, ElementRef, OnInit, Renderer2, OnDestroy, NgZone } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { KnowledgeBaseService } from '../../knowledge-base/knowledge-base.service';
import { Answer } from './answer.model';
import { Measure } from '../measures/measure.model';
import { EvaluationService } from 'app/entry/entry-content/evaluations/evaluations.service';
import { ModalsService } from 'app/modals/modals.service';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import {GlobalEvaluationService} from '../../../services/global-evaluation.service';

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
  evaluation: Evaluation = new Evaluation();
  questionForm: FormGroup;
  answer: Answer = new Answer();
  measure: Measure = new Measure();
  lastSelectedTag: string;
  elementId: String;
  editor: any;

  constructor(private el: ElementRef,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _evaluationService: EvaluationService,
              private _modalsService: ModalsService,
              private _ngZone: NgZone,
              public _globalEvaluationService: GlobalEvaluationService,
              private renderer: Renderer2) { }

  ngOnInit() {
    this._globalEvaluationService.answerEditionEnabled = true;
    // this._evaluationService.showValidationButton = false;
    this.elementId = 'pia-question-content-' + this.question.id;
    this.questionForm = new FormGroup({
      gauge: new FormControl(0),
      text: new FormControl(),
      list: new FormControl()
    });

    this.answer.getByReferenceAndPia(this.pia.id, this.question.id).then(() => {
      if (this.answer.data) {
        let evaluationRefTo: string = this.answer.id.toString();
        if (this.item.evaluation_mode === 'item') {
          evaluationRefTo = this.section.id + '.' + this.item.id;
        }
        this.evaluation.getByReference(this.pia.id, evaluationRefTo);
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
    });

    this.measure.pia_id = this.pia.id;
    this.measure.findAll().then((entries: any[]) => {
      if (entries) {
        entries.forEach(entry => {
          if (entry.title) {
            this.userMeasures.push(entry.title);
          }
        });
      }
    });
  }

  evaluationChange(evaluation) {
    this.evaluation = evaluation;
  }

  enableGauge() {
    if (this._globalEvaluationService.answerEditionEnabled) {
      this.questionForm.controls['gauge'].enable();
    } else {
      this.questionForm.controls['gauge'].disable();
    }
  }

  checkGaugeChanges(event: any) {
    const value: string = event.target.value;
    const bgElement = event.target.parentNode.querySelector('.pia-gaugeBlock-background');
    bgElement.classList.remove('pia-gaugeBlock-background-1');
    bgElement.classList.remove('pia-gaugeBlock-background-2');
    bgElement.classList.remove('pia-gaugeBlock-background-3');
    bgElement.classList.remove('pia-gaugeBlock-background-4');
    bgElement.classList.add('pia-gaugeBlock-background-' + value);
    const gaugeValue = parseInt(this.questionForm.value.gauge, 10);
    if (this.answer.id) {
      this.answer.data = { text: this.answer.data.text, gauge: gaugeValue, list: this.answer.data.list };
      this.answer.update().then(() => {
        // this._evaluationService.allowEvaluation();
      });
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: gaugeValue, list: [] };
      this.answer.create().then(() => {
        // this._evaluationService.allowEvaluation();
      });
    }
  }

  /**
   * Loads WYSIWYG editor.
   */
  questionContentFocusIn() {
    if (this._globalEvaluationService.answerEditionEnabled) {
      this.loadEditor();
    }
  }

  /**
   * Disables question field + shows edit button + save data.
   */
  questionContentFocusOut() {
    let userText = this.questionForm.controls['text'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (this.answer.id) {
      this.answer.data = { text: userText, gauge: this.answer.data.gauge, list: this.answer.data.list };
      this.answer.update().then(() => {
        this._ngZone.run(() => {
          this._globalEvaluationService.validate();
          // this._evaluationService.allowEvaluation();
        });
      });
    } else if (!this.answer.id && userText !== '') {
      if (this.questionForm.value.text && this.questionForm.value.text.length > 0) {
        this.answer.pia_id = this.pia.id;
        this.answer.reference_to = this.question.id;
        this.answer.data = { text: this.questionForm.value.text, gauge: 0, list: [] };
        this.answer.create().then(() => {
          this._ngZone.run(() => {
            this._globalEvaluationService.validate();
            // this._evaluationService.allowEvaluation();
          });
        });
      }
    }
  }

  /**
   * Adds the measure tag in the database.
   * @param {event} event any event.
   */
  onAdd(event) {
    if (event && event.value.length > 0) {
      let list = [];
      if (this.answer.id) {
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
   * @param {event} event any event.
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
   * @param {event} event any event.
   */
  onRemove(event) {
    let list = [];
    if (this.answer.id) {
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

  onTagEdited(event) {
    let list = [];
    if (this.answer.id) {
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

  onBlur(event) {
    if (event && event.length > 0) {
      let list = [];
      if (this.answer.id) {
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
   * @param {string[]} list list of tags.
   */
  private createOrUpdateList(list: string[]) {
    if (this.answer.id) {
      this.answer.data = { text: this.answer.data.text, gauge: this.answer.data.gauge, list: list };
      this.answer.update().then(() => {
        this._globalEvaluationService.validate();
        // this._evaluationService.allowEvaluation();
      });
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: null, list: list };
      this.answer.create().then(() => {
        this._globalEvaluationService.validate();
        // this._evaluationService.allowEvaluation();
      });
    }
  }

  /**
   * Shows or hides a question.
   */
  displayQuestion(event: any) {
    const accordeon = this.el.nativeElement.querySelector('.pia-accordeon');
    accordeon.classList.toggle('pia-icon-accordeon-down');
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
   * Loads Tiny MCE editor.
   */
  loadEditor() {
    this._knowledgeBaseService.placeholder = this.question.placeholder;
    this._knowledgeBaseService.search('', '', this.question.link_knowledge_base);
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
          this.questionForm.controls['text'].patchValue(editor.getContent());
          this.questionContentFocusOut();
          this.closeEditor();
        });
      },
    });
  }

  /**
   * Destroys editor.
   */
  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  private closeEditor() {
    this._knowledgeBaseService.placeholder = null;
    tinymce.remove(this.editor);
    this.editor = null;
  }
}
