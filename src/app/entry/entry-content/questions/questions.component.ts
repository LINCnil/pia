import {Component, ElementRef, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnInit {
  questionForm: FormGroup;
  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.questionForm = new FormGroup({
      textarea: new FormControl()
    });
  }

  /**
   * Hides edit button.
   */
  questionTextareaFocus() {
    const editBtn = this.el.nativeElement.querySelector('.pia-questionBlock-edit');
    editBtn.classList.add('hide');
  }

  /**
   * Disables question fields + shows edit button + save data.
   */
  questionTextareaFocusOut() {
    if (this.questionForm.value.textarea && this.questionForm.value.textarea.length > 0) {
      const editBtn = this.el.nativeElement.querySelector('.pia-questionBlock-edit');
      editBtn.classList.remove('hide');
      this.questionForm.controls['textarea'].disable();
    }
    // Saving data here
  }

  /**
   * Enables or disables edition mode (textarea field) for questions.
   */
  activateQuestionEdition() {
    const editBtn = this.el.nativeElement.querySelector('.pia-questionBlock-edit');
    editBtn.classList.add('hide');
    this.questionForm.controls['textarea'].enable();
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
}
