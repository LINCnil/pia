import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnInit {

  @Input() id: string;
  questionForm: FormGroup;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.questionForm = new FormGroup({
      questionContent: new FormControl()
    });
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
