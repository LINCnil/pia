import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { Evaluation } from 'src/app/models/evaluation.model';
import { Measure } from 'src/app/models/measure.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { Answer } from 'src/app/models/answer.model';
import { AnswerService } from 'src/app/services/answer.service';
import { MeasureService } from 'src/app/services/measures.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit, OnDestroy {
  userMeasures = [];
  allUserAnswersForImpacts = [];
  allUserAnswersForThreats = [];
  allUserAnswersForSources = [];
  allUserAnswersToDisplay = [];
  userAnswersToDisplay = [];
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
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

  constructor(
    private el: ElementRef,
    private knowledgeBaseService: KnowledgeBaseService,
    private ngZone: NgZone,
    public globalEvaluationService: GlobalEvaluationService,
    private answerService: AnswerService,
    private measureService: MeasureService
  ) {}

  ngOnInit(): void {
    this.globalEvaluationService.answerEditionEnabled = true;
    this.elementId = 'pia-question-content-' + this.question.id;
    this.questionForm = new FormGroup({
      gauge: new FormControl(0),
      text: new FormControl(),
      list: new FormControl()
    });

    this.answerService
      .getByReferenceAndPia(this.pia.id, this.question.id)
      .then((answer: Answer) => {
        if (answer) {
          this.answer = answer;
          this.questionForm.controls['gauge'].patchValue(
            this.answer.data.gauge
          );
          this.questionForm.controls['text'].patchValue(this.answer.data.text);
          if (this.answer.data.list) {
            const dataList = this.answer.data.list.filter(l => {
              return l && l.length > 0;
            });
            this.questionForm.controls['list'].patchValue(dataList);
          }
          if (
            this.el.nativeElement.querySelector('.pia-gaugeBlock-background')
          ) {
            this.el.nativeElement
              .querySelector('.pia-gaugeBlock-background')
              .classList.add(
                'pia-gaugeBlock-background-' + this.answer.data.gauge
              );
          }
        }
      });

    this.measure.pia_id = this.pia.id;

    // Fill tags list for Measures
    this.measureService.pia_id = this.pia.id;
    this.measureService.findAllByPia(this.pia.id).then((entries: any[]) => {
      if (entries) {
        entries.forEach(entry => {
          if (entry.title) {
            this.userMeasures.push(entry.title);
          }
        });
      }
    });

    // Fill tags list for Impacts, Threats and Sources from all risks (1, 2 & 3)
    this.answerService.findAllByPia(this.pia.id).then((entries: any[]) => {
      this.allUserAnswersForImpacts = [];
      this.allUserAnswersForThreats = [];
      this.allUserAnswersForSources = [];
      if (entries) {
        entries.forEach(entry => {
          if (entry.data.list && entry.data.list.length > 0) {
            // All user answers for Impacts
            if (
              entry.reference_to === 321 ||
              entry.reference_to === 331 ||
              entry.reference_to === 341
            ) {
              this.allUserAnswersForImpacts.push(entry.data.list);
            } else if (
              entry.reference_to === 322 ||
              entry.reference_to === 332 ||
              entry.reference_to === 342
            ) {
              // All user answers for Threats
              this.allUserAnswersForThreats.push(entry.data.list);
            } else if (
              entry.reference_to === 323 ||
              entry.reference_to === 333 ||
              entry.reference_to === 343
            ) {
              // All user answers for Sources
              this.allUserAnswersForSources.push(entry.data.list);
            }
          }
        });
        this.allUserAnswersForImpacts = [].concat.apply(
          [],
          this.allUserAnswersForImpacts
        );
        this.allUserAnswersForThreats = [].concat.apply(
          [],
          this.allUserAnswersForThreats
        );
        this.allUserAnswersForSources = [].concat.apply(
          [],
          this.allUserAnswersForSources
        );

        // Si la question courante concerne les impacts (321, 331, 341)
        if (
          this.question.id === 321 ||
          this.question.id === 331 ||
          this.question.id === 341
        ) {
          this.userAnswersToDisplay = this.allUserAnswersForImpacts;
        } else if (
          this.question.id === 322 ||
          this.question.id === 332 ||
          this.question.id === 342
        ) {
          // Sinon si la question courante concerne les menaces (322, 332, 342)
          this.userAnswersToDisplay = this.allUserAnswersForThreats;
        } else if (
          this.question.id === 323 ||
          this.question.id === 333 ||
          this.question.id === 343
        ) {
          // Sinon si la question courante concerne les sources (323, 333, 343)
          this.userAnswersToDisplay = this.allUserAnswersForSources;
        }
        this.userAnswersToDisplay = this.userAnswersToDisplay
          .reduce((a, x) => (a.includes(x) ? a : [...a, x]), [])
          .sort();
      }
    });
  }

  ngOnDestroy(): void {
    tinymce.remove(this.editor);
  }

  /**
   * On evaluation change.
   * @param {any} evaluation - Any Evaluation.
   */
  evaluationChange(evaluation): void {
    this.evaluation = evaluation;
  }

  /**
   * Enable the gauge.
   */
  enableGauge(): void {
    if (this.globalEvaluationService.answerEditionEnabled) {
      this.questionForm.controls['gauge'].enable();
    } else {
      this.questionForm.controls['gauge'].disable();
    }
  }

  /**
   * Check gauge change.
   * @param {*} event - Any Event.
   */
  checkGaugeChanges(event: any): void {
    const value: string = event.target.value;
    const bgElement = event.target.parentNode.querySelector(
      '.pia-gaugeBlock-background'
    );
    bgElement.classList.remove('pia-gaugeBlock-background-1');
    bgElement.classList.remove('pia-gaugeBlock-background-2');
    bgElement.classList.remove('pia-gaugeBlock-background-3');
    bgElement.classList.remove('pia-gaugeBlock-background-4');
    bgElement.classList.add('pia-gaugeBlock-background-' + value);
    const gaugeValue = parseInt(this.questionForm.value.gauge, 10);
    if (this.answer.id) {
      this.answer.data = {
        text: this.answer.data.text,
        gauge: gaugeValue,
        list: this.answer.data.list
      };
      this.answerService.update(this.answer).then(() => {
        this.ngZone.run(() => {
          this.globalEvaluationService.validate();
        });
      });
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: gaugeValue, list: [] };
      this.answerService.create(this.answer).then(() => {
        this.ngZone.run(() => {
          this.globalEvaluationService.validate();
        });
      });
    }
  }

  /**
   * Loads WYSIWYG editor.
   */
  questionContentFocusIn(): void {
    if (this.globalEvaluationService.answerEditionEnabled) {
      this.loadEditor();
    }
  }

  /**
   * Disables question field + shows edit button + save data.
   */
  questionContentFocusOut(): void {
    this.answer.pia_id = this.pia.id;
    this.answer.reference_to = this.question.id;
    let userText = this.questionForm.controls['text'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (this.answer.id) {
      this.answer.data = {
        text: userText,
        gauge: this.answer.data.gauge,
        list: this.answer.data.list
      };
      this.answerService.update(this.answer).then(() => {
        this.ngZone.run(() => {
          this.globalEvaluationService.validate();
        });
      });
    } else if (!this.answer.id && userText !== '') {
      if (
        this.questionForm.value.text &&
        this.questionForm.value.text.length > 0
      ) {
        const gaugeValueForCurrentQuestion =
          this.question.answer_type === 'gauge' ? 0 : null;
        this.answer.data = {
          text: this.questionForm.value.text,
          gauge: gaugeValueForCurrentQuestion,
          list: []
        };
        this.answerService.create(this.answer).then(() => {
          this.ngZone.run(() => {
            this.globalEvaluationService.validate();
          });
        });
      }
    }
  }

  /**
   * Adds the measure tag in the database.
   * @param {any} event - Any Event.
   */
  onAdd(event): void {
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
   * @param {any} event - Any Event.
   */
  onSelected(event): void {
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
   */
  onRemove(event): void {
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

  /**
   * On tag edited.
   * @param {any} event - Any Event.
   */
  onTagEdited(event): void {
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

  /**
   * On tag leave.
   * @param {any} event - Any Event.
   */
  onBlur(event): void {
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
   * @private
   * @param {string[]} list - List of tags.
   */
  private createOrUpdateList(list: string[]): void {
    if (this.answer.id) {
      this.answer.data = {
        text: this.answer.data.text,
        gauge: this.answer.data.gauge,
        list: list
      };
      this.answerService.update(this.answer).then(() => {
        this.globalEvaluationService.validate();
      });
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: null, list: list };
      this.answerService.create(this.answer).then(() => {
        this.globalEvaluationService.validate();
      });
    }
  }

  /**
   * Shows or hides a question.
   * @param {*} event - Any Event.
   */
  displayQuestion(event: any): void {
    const accordeon = this.el.nativeElement.querySelector('.pia-accordeon');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector(
      '.pia-questionBlock-displayer'
    );
    displayer.classList.toggle('close');

    // Display comments/evaluations for questions
    const commentsDisplayer = document.querySelector(
      '.pia-commentsBlock-question-' + this.question.id
    );
    const evaluationDisplayer = document.querySelector(
      '.pia-evaluationBlock-question-' + this.question.id
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
   * Loads wysiwyg editor.
   */
  loadEditor(): void {
    this.knowledgeBaseService.placeholder = this.question.placeholder;
    this.knowledgeBaseService.search('', '', this.question.link_knowledge_base);
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
      toolbar:
        'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin: false,
      setup: editor => {
        this.editor = editor;
        editor.on('focusout', () => {
          this.questionForm.controls['text'].patchValue(editor.getContent());
          this.questionContentFocusOut();
          this.closeEditor();
        });
      }
    });
  }

  /**
   * Close the editor.
   * @private
   */
  private closeEditor() {
    this.knowledgeBaseService.placeholder = null;
    tinymce.remove(this.editor);
    this.editor = null;
  }
}
