import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import { KnowledgeBaseService } from '../../knowledge-base/knowledge-base.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnInit {

  tags = [];
  userMeasures = ['user_measure1', 'user_measure2', 'user_measure3'];
  @Input() question: any;
  @Input() item: any;
  @Input() pia: any;
  questionForm: FormGroup;

  constructor(private el: ElementRef, private _knowledgeBaseService: KnowledgeBaseService) { }

  ngOnInit() {
    this.questionForm = new FormGroup({
      questionGauge: new FormControl(),
      questionContent: new FormControl(),
      questionTags: new FormControl()
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
    if (this.questionForm.value.questionContent && this.questionForm.value.questionContent.length > 0) {
      this.showEditButton();
      this.questionForm.controls['questionContent'].disable();
    }
    // Saving data here
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
    alert(this.questionForm.value.questionTags);
    // Saving data here
  }

  /* TODO onAdd */
  /**
   * Adds the measure tag in the database.
   * @param {event} event any event.
   */
  onAdd(event) {
    console.log(event);
  }


  /* TODO onTagEdited */
  /**
   * Updates the edited measure tag in the database.
   * @param {event} event any event.
   */
  onTagEdited(event) {
    console.log(event);
  }

  /* TODO onRemove */
  /**
   * Removes the measure tag from the database.
   * @param {event} event any event.
   */
  onRemove(event) {
    console.log(event);
  }

  /**
   * Enables or disables edition mode (fields) for questions.
   */
  activateQuestionEdition() {
    this.hideEditButton();
    this.questionForm.controls['questionContent'].enable();
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
