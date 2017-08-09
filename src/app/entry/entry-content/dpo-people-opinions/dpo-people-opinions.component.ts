import { Component, ElementRef, OnInit, Input } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import {Pia} from 'app/entry/pia.model';

import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-dpo-people-opinions',
  templateUrl: './dpo-people-opinions.component.html',
  styleUrls: ['./dpo-people-opinions.component.scss'],
  providers: [PiaService]
})
export class DPOPeopleOpinionsComponent implements OnInit {
  dpo_status_locker: boolean;
  concerned_people_status_locker: boolean;
  DPOForm: FormGroup;
  peopleForm: FormGroup;
  displayDpoEditButton = false;
  displayPeopleEditButton = false;

  constructor(private el: ElementRef, private _piaService: PiaService) { }

  ngOnInit() {
    this.DPOForm = new FormGroup({
      DPOStatus : new FormControl(),
      DPOOpinion : new FormControl(),
      DPONames : new FormControl()
    });
    this.peopleForm = new FormGroup({
      peopleStatus : new FormControl(),
      peopleOpinion : new FormControl(),
      peopleNames: new FormControl()
    });
    this._piaService.getPIA().then(() => {
      /* TODO : lock fields (names, statuses, opinions) when PIA is validated */
      /*if (pia.status === 2 || pia.status === 3) {
        this.peopleForm.disable();
      }*/

      if (this._piaService.pia.dpos_names && this._piaService.pia.dpos_names.length > 0) {
        this.DPOForm.controls['DPONames'].patchValue(this._piaService.pia.dpos_names);
        this.DPOForm.controls['DPONames'].disable();
        this.displayDpoEditButton = true;
      }
      if (this._piaService.pia.dpo_status && this._piaService.pia.dpo_status >= 0) {
        this.dpo_status_locker = true;
        this.DPOForm.controls['DPOStatus'].patchValue(this._piaService.pia.dpo_status);
        this.displayDpoEditButton = true;
      } else {
        this.dpo_status_locker = true;
      }
      if (this._piaService.pia.dpo_opinion && this._piaService.pia.dpo_opinion.length > 0) {
        this.DPOForm.controls['DPOOpinion'].patchValue(this._piaService.pia.dpo_opinion);
        this.DPOForm.controls['DPOOpinion'].disable();
        this.displayDpoEditButton = true;
      } else {
        this.DPOForm.controls['DPOOpinion'].disable();
      }

      if (this._piaService.pia.people_names && this._piaService.pia.people_names.length > 0) {
        this.peopleForm.controls['peopleNames'].patchValue(this._piaService.pia.people_names);
        this.peopleForm.controls['peopleNames'].disable();
        this.displayPeopleEditButton = true;
      }
      if (this._piaService.pia.concerned_people_status === 0 || this._piaService.pia.concerned_people_status === 1) {
        this.peopleForm.controls['peopleStatus'].patchValue(this._piaService.pia.concerned_people_status);
        this.concerned_people_status_locker = true;
        this.displayPeopleEditButton = true;
      } else {
        this.concerned_people_status_locker = true;
      }
      if (this._piaService.pia.concerned_people_opinion && this._piaService.pia.concerned_people_opinion.length > 0) {
        this.peopleForm.controls['peopleOpinion'].patchValue(this._piaService.pia.concerned_people_opinion);
        this.peopleForm.controls['peopleOpinion'].disable();
        this.displayPeopleEditButton = true;
      } else {
        this.peopleForm.controls['peopleOpinion'].disable();
      }

      if (this._piaService.pia.status >= 2) {
        this.DPOForm.disable();
        this.peopleForm.disable();
        this.displayPeopleEditButton = false;
        this.displayDpoEditButton = false;
      }
    });
  }

  /**
   * Disables DPO fields (status + opinion) and saves data.
   */
  DPOFocusOut() {
    if (this.DPOForm.value.DPOOpinion && this.DPOForm.value.DPOOpinion.length > 0 && this.DPOForm.value.DPONames &&
        this.DPOForm.value.DPONames.length > 0 && this.DPOForm.controls['DPOStatus'].dirty) {
      this.DPOForm.disable();
      this.displayDpoEditButton = true;
      this._piaService.pia.dpo_opinion = this.DPOForm.value.DPOOpinion;
      this._piaService.pia.dpo_status = parseInt(this.DPOForm.value.DPOStatus, 10);
      this._piaService.pia.dpos_names = this.DPOForm.value.DPONames;
      this._piaService.pia.update();
    } else if (!this.DPOForm.value.DPONames || this.DPOForm.value.DPONames.length <= 0) {
      this._piaService.pia.dpo_opinion = null;
      this._piaService.pia.dpo_status = null;
      this._piaService.pia.dpos_names = null;
      this._piaService.pia.update().then(() => {
        this.DPOForm.controls['DPOOpinion'].patchValue(null);
        this.DPOForm.controls['DPONames'].patchValue(null);
        this.DPOForm.controls['DPOStatus'].patchValue(null);
      });
    } else if (this.DPOForm.value.DPONames && this.DPOForm.value.DPONames.length > 0) {
      this.activateDPOEdition()
    }
  }

  /**
   * Activates DPO fields (status + opinion).
   */
  activateDPOEdition() {
    this.displayDpoEditButton = false;
    this.DPOForm.enable();
  }

  /**
   * Disables people fields (status + opinion) and saves data.
   */
  peopleFocusOut() {
    if (this.peopleForm.value.peopleOpinion &&
      this.peopleForm.value.peopleOpinion.length > 0 &&
      this.peopleForm.value.peopleNames &&
      this.peopleForm.value.peopleNames.length > 0 &&
      this.peopleForm.controls['peopleStatus'].dirty) {
      this.peopleForm.disable();
      this.displayPeopleEditButton = true;
      this._piaService.pia.concerned_people_opinion = this.peopleForm.value.peopleOpinion;
      this._piaService.pia.concerned_people_status = parseInt(this.peopleForm.value.peopleStatus, 10);
      this._piaService.pia.people_names = this.peopleForm.value.peopleNames;
      this._piaService.pia.update();
    } else if (!this.peopleForm.value.peopleNames || this.peopleForm.value.peopleNames.length <= 0) {
      this._piaService.pia.concerned_people_opinion = null;
      this._piaService.pia.concerned_people_status = null;
      this._piaService.pia.people_names = null;
      this._piaService.pia.update().then(() => {
        this.peopleForm.controls['peopleOpinion'].patchValue(null);
        this.peopleForm.controls['peopleNames'].patchValue(null);
        this.peopleForm.controls['peopleStatus'].patchValue(null);
      });
    } else if (this.peopleForm.value.peopleNames && this.peopleForm.value.peopleNames.length > 0) {
      this.activatePeopleEdition()
    }
  }

  /**
   * Activates people fields (status + opinion).
   */
  activatePeopleEdition() {
    this.displayPeopleEditButton = false;
    this.peopleForm.enable();
  }
}
