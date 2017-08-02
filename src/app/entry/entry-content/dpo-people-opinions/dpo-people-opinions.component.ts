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
  dpo_status_1_checker: boolean;
  dpo_status_0_checker: boolean;
  DPOForm: FormGroup;
  peopleForm: FormGroup;

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
      /*if (pia.status === 4) {
        this.peopleForm.disable();
      }*/
      this.DPOForm.controls['DPOOpinion'].patchValue(this._piaService.pia.dpo_opinion);
      this.DPOForm.controls['DPONames'].patchValue(this._piaService.pia.dpos_names);
      this.peopleForm.controls['peopleOpinion'].patchValue(this._piaService.pia.concerned_people_opinion);
      this.peopleForm.controls['peopleNames'].patchValue(this._piaService.pia.people_names);
      /*TODO: check if values then lock*/
      this.DPOForm.disable();
      this.showDPOEditButton();
      this.peopleForm.disable();
      this.showPeopleEditButton();
    });
  }

  /**
   * Disables DPO fields (status + opinion) and saves data.
   */
  DPOFocusOut() {
    if (this.DPOForm.value.DPOOpinion &&
        this.DPOForm.value.DPOOpinion.length > 0 &&
        this.DPOForm.value.DPONames &&
        this.DPOForm.value.DPONames.length > 0 &&
        this.DPOForm.controls['DPOStatus'].dirty) {
      this.DPOForm.disable();
      this.showDPOEditButton();
      const pia = new Pia();
      pia.id = this._piaService.pia.id;
      pia.get(pia.id).then(() => {
        pia.dpo_opinion = this.DPOForm.value.DPOOpinion;
        pia.dpo_status = parseInt(this.DPOForm.value.DPOStatus, 10);
        pia.dpos_names = this.DPOForm.value.DPONames;
        pia.update()
      });
    }
  }

  /**
   * Activates DPO fields (status + opinion).
   */
  activateDPOEdition() {
    this.hideDPOEditButton();
    this.DPOForm.enable();
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
    if (this.peopleForm.value.peopleOpinion &&
      this.peopleForm.value.peopleOpinion.length > 0 &&
      this.peopleForm.value.peopleNames &&
      this.peopleForm.value.peopleNames.length > 0 &&
      this.peopleForm.controls['peopleStatus'].dirty) {
      this.peopleForm.disable();
      this.showPeopleEditButton();
      const pia = new Pia();
      pia.id = this._piaService.pia.id;
      pia.get(pia.id).then(() => {
        pia.concerned_people_opinion = this.DPOForm.value.DPOOpinion;
        pia.concerned_people_status = parseInt(this.peopleForm.value.peopleStatus, 10);
        pia.people_names = this.peopleForm.value.peopleNames;
        pia.update()
      });
    }
    // Saving data here
  }

  /**
   * Activates people fields (status + opinion).
   */
  activatePeopleEdition() {
    this.hidePeopleEditButton();
    this.peopleForm.enable();
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

  /**
   * Shows names (DPO & concerned people names) as inputs.
   * @return true if the PIA is not validated, false otherwise.
   */
  showNamesAsInputs() {
    return (this._piaService.pia.status !== 2 && this._piaService.pia.status !== 3);
  }

  /**
   * Shows names (DPO & concerned people names) as beautiful labels.
   * @return true if the PIA is validated, false otherwise.
   */
  showNamesAsLabels() {
    return (this._piaService.pia.status === 2 || this._piaService.pia.status === 3);
  }
}
