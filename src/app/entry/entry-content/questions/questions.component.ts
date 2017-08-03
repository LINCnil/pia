import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import { KnowledgeBaseService } from '../../knowledge-base/knowledge-base.service';
import { Answer } from './answer.model';
import { Measure } from '../measures/measure.model';

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
  questionForm: FormGroup;
  answer: Answer = new Answer();
  measure: Measure = new Measure();

  constructor(private el: ElementRef, private _knowledgeBaseService: KnowledgeBaseService) { }

  ngOnInit() {
    this.questionForm = new FormGroup({
      gauge: new FormControl(0),
      text: new FormControl(),
      list: new FormControl()
    });
    this.answer.getByReferenceAndPia(this.pia.id, this.question.id).then(() => {
      if (this.answer.data) {
        this.questionForm.controls['gauge'].patchValue(this.answer.data.gauge);
        this.questionForm.controls['text'].patchValue(this.answer.data.text);
        this.questionForm.controls['list'].patchValue(this.answer.data.list);
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
          this.showEditButton();
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
    bgElement.classList.remove('pia-gaugeBlock-background-2');
    bgElement.classList.remove('pia-gaugeBlock-background-3');
    bgElement.classList.remove('pia-gaugeBlock-background-4');
    bgElement.classList.add('pia-gaugeBlock-background-' + value);
    const gaugeValue = parseInt(this.questionForm.value.gauge, 10);
    if (gaugeValue > 0) {
      if (this.answer.id) {
        this.answer.data = { text: this.answer.data.text, gauge: gaugeValue, list: this.answer.data.list };
        this.answer.update().then(() => {
          this.showEditButton();
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
          this.showEditButton();
          this.questionForm.controls['gauge'].disable();
          if (this.questionForm.value.text && this.questionForm.value.text.length > 0) {
            this.questionForm.controls['text'].disable();
          }
        });
      }
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
          this.showEditButton();
          this.questionForm.controls['text'].disable();
          if (gaugeValue > 0) {
            this.questionForm.controls['gauge'].disable();
          }
        });
      } else {
        this.answer.pia_id = this.pia.id;
        this.answer.reference_to = this.question.id;
        this.answer.data = { text: this.questionForm.value.text, gauge: 1, list: [] };
        this.answer.create().then(() => {
          this.showEditButton();
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
   * Disables question field + shows edit button + save data.
   */
  questionTagsFocusOut() {
    alert(this.questionForm.value.list);
    // Saving data here
  }

  /**
   * Adds the measure tag in the database.
   * @param {event} event any event.
   */
  onAdd(event) {
    let list = [];
    if (this.answer.id) {
      list = this.answer.data.list;
    }
    list.push(event.value);
    this.createOrUpdateList(list);
  }

  /**
   * Create or update the tags list
   * @param {string[]} list of tags
   */
  private createOrUpdateList(list: string[]) {
    if (this.answer.id) {
      this.answer.data = { text: this.answer.data.text, gauge: this.answer.data.gauge, list: list };
      this.answer.update();
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: null, gauge: null, list: list };
      this.answer.create();
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
    this.hideEditButton();
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

  /**
   * Shows question edit button.
   */
  showEditButton() {
    const editBtn = this.el.nativeElement.querySelector('.pia-questionBlock-edit');
    editBtn.classList.remove('hide');
  }
  /**
   * Hides question edit button.
   */
  hideEditButton() {
    const editBtn = this.el.nativeElement.querySelector('.pia-questionBlock-edit');
    editBtn.classList.add('hide');
  }

}
