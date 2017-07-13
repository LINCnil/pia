import { Component, ElementRef, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-dpo-people-opinions',
  templateUrl: './dpo-people-opinions.component.html',
  styleUrls: ['./dpo-people-opinions.component.scss']
})
export class DPOPeopleOpinionsComponent implements OnInit {

  DPOForm: FormGroup;
  peopleForm: FormGroup;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.DPOForm = new FormGroup({
      DPOStatus : new FormControl(),
      DPOOpinion: new FormControl()
    });
    this.peopleForm = new FormGroup({
      peopleStatus : new FormControl(),
      peopleOpinion: new FormControl()
    });
  }

  /**
   * Disables DPO fields (status + opinion) and saves data.
   */
  DPOFocusOut() {
    if (this.DPOForm.value.DPOOpinion && this.DPOForm.value.DPOOpinion.length > 0 && this.DPOForm.controls['DPOStatus'].dirty) {
      this.DPOForm.controls['DPOStatus'].disable();
      this.DPOForm.controls['DPOOpinion'].disable();
      this.showDPOEditButton();
    }
    // Saving data here
  }

  /**
   * Activates DPO fields (status + opinion).
   */
  activateDPOEdition() {
    this.hideDPOEditButton();
    this.DPOForm.controls['DPOStatus'].enable();
    this.DPOForm.controls['DPOOpinion'].enable();
  }

  /**
   * Shows DPO edit button.
   */
  showDPOEditButton() {
    const editBtn = this.el.nativeElement.querySelector('#piaDPOPencil');
    editBtn.classList.remove('hide');
  }

  /**
   * Hides DPO edit button.
   */
  hideDPOEditButton() {
    const editBtn = this.el.nativeElement.querySelector('#piaDPOPencil');
    editBtn.classList.add('hide');
  }

  /**
   * Disables people fields (status + opinion) and saves data.
   */
  peopleFocusOut() {
    if (this.peopleForm.value.peopleOpinion && this.peopleForm.value.peopleOpinion.length > 0 && this.peopleForm.controls['peopleStatus'].dirty) {
      this.peopleForm.controls['peopleStatus'].disable();
      this.peopleForm.controls['peopleOpinion'].disable();
      this.showPeopleEditButton();
    }
    // Saving data here
  }

  /**
   * Activates people fields (status + opinion).
   */
  activatePeopleEdition() {
    this.hidePeopleEditButton();
    this.peopleForm.controls['peopleStatus'].enable();
    this.peopleForm.controls['peopleOpinion'].enable();
  }

  /**
   * Shows people edit button.
   */
  showPeopleEditButton() {
    const editBtn = this.el.nativeElement.querySelector('#piaPeoplePencil');
    editBtn.classList.remove('hide');
  }

  /**
   * Hides people edit button.
   */
  hidePeopleEditButton() {
    const editBtn = this.el.nativeElement.querySelector('#piaPeoplePencil');
    editBtn.classList.add('hide');
  }
}
