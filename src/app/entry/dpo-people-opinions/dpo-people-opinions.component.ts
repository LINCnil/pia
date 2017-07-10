import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-dpo-people-opinions',
  templateUrl: './dpo-people-opinions.component.html',
  styleUrls: ['./dpo-people-opinions.component.scss']
})
export class DPOPeopleOpinionsComponent implements OnInit {
  treatments = ['Le traitement peut être mis en oeuvre', 'Le traitement ne doit pas être mis en oeuvre'];
  treatmentForm: FormGroup;
  constructor() { }

  ngOnInit() {
    this.treatmentForm = new FormGroup({
      treatment : new FormControl()
    });
  }

}
