import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
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

  // Disable fields + save data
  focusOut() {
    this.editStatus = true;
    // Saving data here
  }

  activateEdition() {
    this.editStatus = false;
  }

  displayQuestion() {
    const accordeon = this.el.nativeElement.querySelector('.pia-questionBlock-title button span');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector('.pia-questionBlock-displayer');
    displayer.classList.toggle('close');
  }

}
