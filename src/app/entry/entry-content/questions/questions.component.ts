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
  @Input() pia: any;
  questionForm: FormGroup;
  answer: Answer = new Answer();
  measure: Measure = new Measure();

  constructor(private el: ElementRef, private _knowledgeBaseService: KnowledgeBaseService) { }

  ngOnInit() {
    this.questionForm = new FormGroup({
      gauge: new FormControl(),
      text: new FormControl(),
      list: new FormControl()
    });
    this.answer.getByReferenceAndPia(this.pia.id, this.question.id).then(() => {
      if (this.answer.data) {
        this.questionForm.controls['gauge'].patchValue(this.answer.data.gauge);
        this.questionForm.controls['text'].patchValue(this.answer.data.text);
        this.questionForm.controls['list'].patchValue(this.answer.data.list);
        this.showEditButton();
        this.questionForm.controls['text'].disable();
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
  checkGaugeChanges() {

  }

  /**
   * Disables question field + shows edit button + save data.
   */
  questionContentFocusOut() {
    if (this.questionForm.value.text && this.questionForm.value.text.length > 0) {
      if (this.answer.id) {
        this.answer.data = { text: this.questionForm.value.text, gauge: null, list: [] };
        this.answer.update().then(() => {
          this.showEditButton();
          this.questionForm.controls['text'].disable();
        });
      } else {
        this.answer.pia_id = this.pia.id;
        this.answer.reference_to = this.question.id;
        this.answer.data = { text: this.questionForm.value.text, gauge: null, list: [] };
        this.answer.create().then((id: number) => {
          this.answer.id = id;
          this.showEditButton();
          this.questionForm.controls['text'].disable();
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

  /* TODO onAdd */
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

  private createOrUpdateList(list: string[]) {
    if (this.answer.id) {
      this.answer.data = { text: '', gauge: null, list: list };
      this.answer.update();
    } else {
      this.answer.pia_id = this.pia.id;
      this.answer.reference_to = this.question.id;
      this.answer.data = { text: '', gauge: null, list: list };
      this.answer.create();
    }
  }

  /* TODO onRemove */
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
