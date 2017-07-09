import {Component, ElementRef, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnInit {
  @ViewChild('f') form: NgForm;
  public editStatus: boolean;
  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    console.log(form);
  }

  /**
   * Disables fields and save data.
   */
  focusOut() {
    this.editStatus = true;
    // Saving data here
  }

  /**
   * Enables or disables edition mode (fields) for a specific question.
   */
  activateEdition() {
    this.editStatus = false;
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
