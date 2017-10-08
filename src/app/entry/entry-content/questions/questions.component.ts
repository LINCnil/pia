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
  displayEditButton = false;
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
              private renderer: Renderer2) { }

  ngOnInit() {
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
        this.evaluation.getByReference(this.pia.id, evaluationRefTo).then(() => {
          this.checkDisplayButtons();
        });
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
          if (this.answer.data.gauge > 0) {
            this.questionForm.controls['gauge'].disable();
          }
        }
        if (this.answer.data.text && this.answer.data.text.length > 0) {
          this.questionForm.controls['text'].disable();
        }
        if (this.answer.data.gauge > 0 || (this.answer.data.text && this.answer.data.text.length > 0)) {
          if (!this._evaluationService.showValidationButton && !this._evaluationService.enableFinalValidation) {
            this.displayEditButton = true;
          }
        }
      }
      const textarea = document.getElementById('pia-question-content-' + this.question.id);
      if (textarea) {
        this.autoTextareaResize(null, textarea);
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
    this.displayEditButton = false;
    if (this.evaluation && [0, 1].includes(this.evaluation.status)) {
      this.displayEditButton = true;
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
        this._evaluationService.allowEvaluation();
        this.displayEditButton = true;
        this.questionForm.controls['gauge'].disable();
        if (this.questionForm.value.text && this.questionForm.value.text.length > 0) {
          this.questionForm.controls['text'].disable();
        }
      });
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: gaugeValue, list: [] };
      this.answer.create().then(() => {
        this._evaluationService.allowEvaluation();
        this.displayEditButton = true;
        this.questionForm.controls['gauge'].disable();
        if (this.questionForm.value.text && this.questionForm.value.text.length > 0) {
          this.questionForm.controls['text'].disable();
        }
      });
    }
  }

  /**
   * Disables question field + shows edit button + save data.
   */
  questionContentFocusOut() {
    this.editor = null;
    const gaugeValue = parseInt(this.questionForm.value.gauge, 10);
    const userText = this.questionForm.value.text.replace(/^\s+/, '').replace(/\s+$/, '');
    if (this.answer.id) {
      if (userText === '') {
        this.questionForm.value.text = '';
      }
      if (userText !== '' || this.questionForm.value.text === '') {
        this.answer.data = { text: this.questionForm.value.text, gauge: this.answer.data.gauge, list: this.answer.data.list };
        this.answer.update().then(() => {
          this._ngZone.run(() => {
            this._evaluationService.allowEvaluation();
            if (this.questionForm.value.text !== '') {
              this.displayEditButton = true;
              this.questionForm.controls['text'].disable();
            }
            if (gaugeValue > 0) {
              this.questionForm.controls['gauge'].disable();
            }
          });
        });
      }
    } else if (!this.answer.id && userText !== '') {
      if (this.questionForm.value.text && this.questionForm.value.text.length >= 0) {
        this.answer.pia_id = this.pia.id;
        this.answer.reference_to = this.question.id;
        this.answer.data = { text: this.questionForm.value.text, gauge: 0, list: [] };
        this.answer.create().then(() => {
          this._ngZone.run(() => {
            this._evaluationService.allowEvaluation();
            this.displayEditButton = true;
            this.questionForm.controls['text'].disable();
            if (gaugeValue > 0) {
              this.questionForm.controls['gauge'].disable();
            }
          });
        });
      }
    }
  }

  /**
   * Load wysiwyg editor
   */
  questionContentFocusIn() {
    this.loadEditor();
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
   * Create or update the tags list
   * @param {string[]} list of tags
   */
  private createOrUpdateList(list: string[]) {
    if (this.answer.id) {
      this.answer.data = { text: this.answer.data.text, gauge: this.answer.data.gauge, list: list };
      this.answer.update().then(() => {
        this._evaluationService.allowEvaluation();
      });
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: null, list: list };
      this.answer.create().then(() => {
        this._evaluationService.allowEvaluation();
      });
    }
  }

  /**
   * Enables or disables edition mode (fields) for questions.
   */
  activateQuestionEdition() {
    this.displayEditButton = false;
    this.questionForm.controls['text'].enable();
    this.questionForm.controls['gauge'].enable();
    this.loadEditor();
  }

  /**
   * Shows or hides a question.
   */
  displayQuestion(event: any) {
    const accordeon = this.el.nativeElement.querySelector('.pia-questionBlock-title button');
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

  loadEditor() {
    this._knowledgeBaseService.placeholder = this.question.placeholder;
    this._knowledgeBaseService.search('', '', this.question.link_knowledge_base);
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
      skin_url: '/assets/skins/lightgray',
      setup: editor => {
        this.editor = editor;
        editor.on('focusout', () => {
          this.questionForm.controls['text'].patchValue(editor.getContent());
          this.questionContentFocusOut();
          tinymce.remove(this.editor);
        });
      },
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }
}
