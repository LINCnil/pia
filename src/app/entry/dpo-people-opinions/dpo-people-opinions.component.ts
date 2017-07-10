import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-dpo-people-opinions',
  templateUrl: './dpo-people-opinions.component.html',
  styleUrls: ['./dpo-people-opinions.component.scss']
})
export class DPOPeopleOpinionsComponent implements OnInit {
  treatmentForm: FormGroup;
  dpoAvisForm: FormGroup;
  public dpoEditStatus: boolean;
  public peopleEditStatus: boolean;
  constructor() { }

  /**
   * Disables fields and save data.
   */
  dpoFocusOut() {
    this.dpoEditStatus = true;
    // Saving data here
    console.log('ok');
  }


  ngOnInit() {
    this.treatmentForm = new FormGroup({
      treatment : new FormControl()
    });
    this.dpoAvisForm = new FormGroup({
      dpoAvis : new FormControl()
    });
  }
}
