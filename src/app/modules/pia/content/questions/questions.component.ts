import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
  styleUrls: ['./questions.component.scss'],
  standalone: false
})
export class QuestionsComponent implements OnInit, OnDestroy {
  userMeasures = [];
  allUserAnswersForImpacts = [];
  allUserAnswersForThreats = [];
  allUserAnswersForSources = [];
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
  gaugeValue = 0;
  hideTextarea = false;

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
          this.gaugeValue = this.answer.data.gauge;
          this.questionForm.controls['gauge'].setValue(this.answer.data.gauge, {
            emitEvent: false
          });
          if (this.isInputDisabled()) {
            this.questionForm.controls['gauge'].disable({
              onlySelf: true,
              emitEvent: false
            });
          } else {
            this.questionForm.controls['gauge'].enable({
              onlySelf: true,
              emitEvent: false
            });
          }
          this.questionForm.controls['text'].patchValue(this.answer.data.text);
          this.hideTextarea = this.answer.data.text?.length > 0;
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
    // @ts-ignore
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
    const gaugeValue = parseInt(this.questionForm.getRawValue().gauge, 10);
    this.gaugeValue = gaugeValue;

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

      await this.answerService
        .update(this.answer)
        .then((answer: Answer) => {
          this.answer = answer;
          this.ngZone.run(() => {
            this.globalEvaluationService.validate();
          });
        })
        .catch(error => {
          if (error.statusText === 'Conflict') {
            this.conflictDialog(error);
          }
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

        await this.answerService.create(this.answer).then(() => {
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
        list
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
      this.answer.data = { text: null, gauge: null, list };

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
      if (commentsDisplayer) {
        commentsDisplayer.classList.remove('hide');
      }
      if (evaluationDisplayer && this.evaluation.status > 0) {
        evaluationDisplayer.classList.remove('hide');
      }
    } else {
      event.target.setAttribute('data-status', 'hide');
      if (commentsDisplayer) {
        commentsDisplayer.classList.add('hide');
      }
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

    // @ts-ignore
    tinymce.init({
      license_key: 'gpl',
      base_url: '/tinymce',
      suffix: '.min',
      branding: false,
      menubar: false,
      entity_encoding: 'raw',
      statusbar: false,
      plugins: 'autoresize lists',
      autoresize_bottom_margin: 30,
      auto_focus: this.elementId,
      autoresize_min_height: 40,
      selector: '#' + this.elementId,
      content_style: `
        body {
          font-size: 0.8rem;
        }`,
      toolbar:
        'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      placeholder: '',
      setup: editor => {
        this.editor = editor;
        editor.on('focusout', () => {
          const newContent = editor.getContent();
          this.questionForm.controls['text'].patchValue(newContent);
          this.questionContentFocusOut().then(() => {
            this.hideTextarea = newContent.length > 0;
            this.knowledgeBaseService.placeholder = null;
            tinymce.remove(this.editor);
            this.editor = null;
          });
        });
      }
    });
  }

  /**
   * Gets the appropriate autocomplete items based on whether the question is a measure
   * @returns {any[]} The autocomplete items to display
   */
  getAutocompleteItems(): any[] {
    return this.question.is_measure
      ? this.userMeasures
      : this.userAnswersToDisplay;
  }

  /**
   * Checks if the input field should be disabled.
   * @returns {boolean} True if the input should be disabled, false otherwise.
   */
  isInputDisabled(): boolean {
    return (
      !this.globalEvaluationService.answerEditionEnabled ||
      (!this.editMode.includes('author') && this.editMode !== 'local')
    );
  }

  /**
   * Open a dialog modal for deal with the conflict
   * @param err
   */
  private conflictDialog(err: any): void {
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
            const newAnswerFixed: Answer = { ...err.params };
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
              .catch(error => {});
          }
        },
        {
          label: this.translateService.instant('conflict.merge'),
          callback: () => {
            const newAnswerFixed: Answer = { ...err.record };
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
              .catch(error => {});
          }
        }
      ]
    );
  }
}
