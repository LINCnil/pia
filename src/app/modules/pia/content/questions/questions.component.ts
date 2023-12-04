import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'src/app/services/dialog.service';
import { Router } from '@angular/router';

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
  questionForm: UntypedFormGroup;
  answer: Answer = new Answer();
  measure: Measure = new Measure();
  lastSelectedTag: string;
  elementId: string;
  editor: any;
  loading = false;

  constructor(
    private router: Router,
    private el: ElementRef,
    private knowledgeBaseService: KnowledgeBaseService,
    private ngZone: NgZone,
    public globalEvaluationService: GlobalEvaluationService,
    private answerService: AnswerService,
    private measureService: MeasureService,
    private translateService: TranslateService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.globalEvaluationService.answerEditionEnabled = true;
    this.elementId = 'pia-question-content-' + this.question.id;
    this.questionForm = new UntypedFormGroup({
      gauge: new UntypedFormControl(0),
      text: new UntypedFormControl(),
      list: new UntypedFormControl()
    });

    this.loading = true;
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
        }
      })
      .finally(() => {
        this.loading = false;
      });

    this.measure.pia_id = this.pia.id;

    // Fill tags list for Measures
    this.loading = true;
    this.measureService.pia_id = this.pia.id;
    this.measureService
      .findAllByPia(this.pia.id)
      .then((entries: any[]) => {
        if (entries) {
          entries.forEach(entry => {
            if (entry.title) {
              this.userMeasures.push(entry.title);
            }
          });
        }
      })
      .finally(() => {
        this.loading = false;
      });

    // Fill tags list for Impacts, Threats and Sources from all risks (1, 2 & 3)
    this.loading = true;
    this.answerService
      .findAllByPia(this.pia.id)
      .then((entries: any[]) => {
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
      })
      .finally(() => {
        this.loading = false;
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

    // this.loading = true;
    if (this.answer.id) {
      this.answer.data = {
        text: this.answer.data.text,
        gauge: gaugeValue,
        list: this.answer.data.list
      };

      this.answerService.update(this.answer).then((answer: Answer) => {
        this.answer = answer;
        this.ngZone.run(() => {
          this.globalEvaluationService.validate();
        });
      });
      // .finally(() => {
      //   this.loading = false;
      // });
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: gaugeValue, list: [] };

      this.answerService.create(this.answer).then(() => {
        this.ngZone.run(() => {
          this.globalEvaluationService.validate();
        });
      });
      // .finally(() => {
      //   this.loading = false;
      // });
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
  async questionContentFocusOut(): Promise<void> {
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

      // this.loading = true;
      await this.answerService
        .update(this.answer)
        .then((answer: Answer) => {
          this.answer = answer;
          this.ngZone.run(() => {
            this.globalEvaluationService.validate();
          });
        })
        .catch(err => {
          if (err.statusText === 'Conflict') {
            this.conflictDialog(err);
          }
        });
      // .finally(() => {
      //   this.loading = false;
      // });
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

        // this.loading = true;
        await this.answerService.create(this.answer).then(() => {
          this.ngZone.run(() => {
            this.globalEvaluationService.validate();
          });
        });
        // .finally(() => {
        //   this.loading = false;
        // });
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
      if (this.answer.id && this.answer.data.list) {
        list = [...list, ...this.answer.data.list];
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
    this.loading = true;
    if (this.answer.id) {
      this.answer.data = {
        text: this.answer.data.text,
        gauge: this.answer.data.gauge,
        list: list
      };

      this.answerService
        .update(this.answer)
        .then((answer: Answer) => {
          this.answer = answer;
          this.globalEvaluationService.validate();
        })
        .finally(() => {
          this.loading = false;
        });
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: null, list: list };

      this.answerService
        .create(this.answer)
        .then(() => {
          this.globalEvaluationService.validate();
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  /**
   * Shows or hides a question.
   * @param {*} event - Any Event.
   */
  displayQuestion(event: any): void {
    const accordion = this.el.nativeElement.querySelector('.pia-accordion');
    accordion.classList.toggle('pia-icon-accordion-down');
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
    // unset knowlegebase
    this.knowledgeBaseService.placeholder = this.question.placeholder;
    this.knowledgeBaseService.search('', '', this.question.link_knowledge_base);

    setTimeout(() => {
      // init new editor
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
          editor.on('init', () => {
            this.editor = editor;
          });
          editor.on('focusout', () => {
            // Save content
            this.questionForm.controls['text'].patchValue(editor.getContent());
            this.questionContentFocusOut().then(() => {
              this.editor = null;
              tinymce.remove(this.editor); // Warning: take more time then a new initiation
              this.knowledgeBaseService.placeholder = null;
            });
          });
        }
      });
    }, 100);
  }

  /**
   * Open a dialog modal for deal with the conflict
   * @param err
   */
  private conflictDialog(err) {
    let additional_text: string;
    const currentUrl = this.router.url;

    // Text
    additional_text = `
      ${this.translateService.instant('conflict.initial_content')}: ${
      err.record.data.text
    }
      <br>
      ${this.translateService.instant('conflict.new_content')}: ${
      err.params.data.text
    }
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
            let newAnswerFixed: Answer = { ...err.params };
            newAnswerFixed.id = err.record.id;
            newAnswerFixed.lock_version = err.record.lock_version;
            this.answerService
              .update(newAnswerFixed)
              .then(() => {
                this.router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => {
                    this.router.navigate([currentUrl]);
                  });
                return;
              })
              .catch(err => {});
          }
        },
        {
          label: this.translateService.instant('conflict.merge'),
          callback: () => {
            let newAnswerFixed: Answer = { ...err.record };
            newAnswerFixed.data.text += '\n' + err.params.data.text;
            this.answerService
              .update(newAnswerFixed)
              .then(() => {
                this.router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => {
                    this.router.navigate([currentUrl]);
                  });
                return;
              })
              .catch(err => {});
          }
        }
      ]
    );
  }
}
