import { Component, Input, ElementRef, OnInit } from '@angular/core';
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
export class QuestionsComponent implements OnInit {

  tags = [];
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
  reference_to: string;

  constructor(private el: ElementRef,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _evaluationService: EvaluationService,
              private _modalsService: ModalsService) { }

  ngOnInit() {
    this.questionForm = new FormGroup({
      gauge: new FormControl(0),
      text: new FormControl(),
      list: new FormControl()
    });
    this.getReferenceTo();
    this.answer.getByReferenceAndPia(this.pia.id, this.reference_to).then(() => {
      if (this.answer.data) {
        this.evaluation.getByReference(this.pia.id, this.answer.id).then(() => {
          this.checkDisplayButtons();
        });
        this.questionForm.controls['gauge'].patchValue(this.answer.data.gauge);
        this.questionForm.controls['text'].patchValue(this.answer.data.text);
        const dataList = this.answer.data.list.filter((l) => {
          return (l && l.length > 0);
        })
        this.questionForm.controls['list'].patchValue(dataList);
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
          this.displayEditButton = true;
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
    this.checkDisplayButtons();
  }

  checkDisplayButtons() {
    if (this._evaluationService.showValidationButton) {
      this.displayEditButton = false;
    }
    if (this._evaluationService.enableFinalValidation) {
      this.displayEditButton = false;
    }
    if (this.evaluation && this.evaluation.status === 1) {
      this.displayEditButton = true;
    }
  }

  /*
   * TODO : a function to disable gauge after a value selection.
   * It should disable range only if a value has been selected
   * AND that the next target isn't the range input.
   * It disables the field only when the user clicks something different that :
   * The input textarea (under the gauge) OR the range input.
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
      this.answer.reference_to = this.reference_to;
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
    const gaugeValue = parseInt(this.questionForm.value.gauge, 10);
    if (this.questionForm.value.text && this.questionForm.value.text.length > 0) {
      if (this.answer.id) {
        this.answer.data = { text: this.questionForm.value.text, gauge: this.answer.data.gauge, list: this.answer.data.list };
        this.answer.update().then(() => {
          this._evaluationService.allowEvaluation();
          this.displayEditButton = true;
          this.questionForm.controls['text'].disable();
          if (gaugeValue > 0) {
            this.questionForm.controls['gauge'].disable();
          }
        });
      } else {
        this.answer.pia_id = this.pia.id;
        this.answer.reference_to = this.reference_to;
        this.answer.data = { text: this.questionForm.value.text, gauge: 1, list: [] };
        this.answer.create().then(() => {
          this._evaluationService.allowEvaluation();
          this.displayEditButton = true;
          this.questionForm.controls['text'].disable();
          if (gaugeValue > 0) {
            this.questionForm.controls['gauge'].disable();
          }
        });
      }
    }
  }

  /**
   * Show only knowledge base elements for this question
   */
  questionContentFocusIn() {
    this._knowledgeBaseService.search('', '', this.question.link_knowledge_base);
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
      this.answer.reference_to = this.reference_to;
      this.answer.data = { text: null, gauge: null, list: list };
      this.answer.create().then(() => {
        this._evaluationService.allowEvaluation();
      });
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
    const index = list.indexOf(event);
    if (index >= 0) {
      list.splice(list.indexOf(event), 1);
      this.createOrUpdateList(list);
    }
  }

  /**
   * Enables or disables edition mode (fields) for questions.
   */
  activateQuestionEdition() {
    this.displayEditButton = false;
    this.questionForm.controls['text'].enable();
    this.questionForm.controls['gauge'].enable();
  }

  /**
   * Shows or hides a question.
   */
  displayQuestion() {
    const accordeon = this.el.nativeElement.querySelector('.pia-questionBlock-title button span');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector('.pia-questionBlock-displayer');
    displayer.classList.toggle('close');
  }

  private getReferenceTo() {
    this.reference_to = this.question.id; // this.section.id + '.' + this.item.id + '.' + this.question.id;
  }

}
