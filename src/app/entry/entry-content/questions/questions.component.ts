import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnInit {
  @ViewChild('f') form: NgForm;
  private editMode: boolean;
  constructor() { }

  onSubmit(form: NgForm) {
    //console.log(form);
  }

  modEdit() {
    this.editMode = !this.editMode;
    console.log(this.editMode);
  }
  modReedit() {
    this.editMode = !this.editMode;
  }
  ngOnInit() {
  }

}
