import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import { SidStatusService } from 'app/services/sid-status.service';

import {Pia} from 'app/entry/pia.model';

import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-dpo-people-opinions',
  templateUrl: './dpo-people-opinions.component.html',
  styleUrls: ['./dpo-people-opinions.component.scss'],
  providers: [PiaService]
})
export class DPOPeopleOpinionsComponent implements OnInit {
  DPOForm: FormGroup;
  searchedOpinionsForm: FormGroup;
  peopleForm: FormGroup;
  displayDpoEditButton = false;
  displayPeopleEditButton = false;
  displayPeopleOpinions = false;
  displayPeopleSearchContent = false;
  @ViewChild('DpoNames') private elementRef1: ElementRef;
  @ViewChild('PeopleNames') private elementRef2: ElementRef;

  constructor(private el: ElementRef,
              private _sidStatusService: SidStatusService,
              private _piaService: PiaService) { }

  ngOnInit() {
    this.DPOForm = new FormGroup({
      DPOStatus : new FormControl(),
      DPOOpinion : new FormControl(),
      DPONames : new FormControl()
    });
    this.searchedOpinionsForm = new FormGroup({
      searchStatus : new FormControl(),
      searchContent : new FormControl()
    });
    this.peopleForm = new FormGroup({
      peopleStatus : new FormControl(),
      peopleOpinion : new FormControl(),
      peopleNames: new FormControl()
    });

    this._piaService.getPIA().then(() => {
      this._sidStatusService.verificationForDpo(this._piaService);
      if (this._piaService.pia.dpos_names && this._piaService.pia.dpos_names.length > 0) {
        this.DPOForm.controls['DPONames'].patchValue(this._piaService.pia.dpos_names);
        this.DPOForm.controls['DPONames'].disable();
        this.displayDpoEditButton = true;
      } else {
        this.DPOForm.controls['DPOStatus'].disable();
        this.DPOForm.controls['DPOOpinion'].disable();
      }
      if (this._piaService.pia.dpo_status !== undefined) {
        this.DPOForm.controls['DPOStatus'].patchValue(this._piaService.pia.dpo_status);
        this.DPOForm.controls['DPOStatus'].disable();
        this.displayDpoEditButton = true;
      }
      if (this._piaService.pia.dpo_opinion && this._piaService.pia.dpo_opinion.length > 0) {
        this.DPOForm.controls['DPOOpinion'].patchValue(this._piaService.pia.dpo_opinion);
        this.DPOForm.controls['DPOOpinion'].disable();
        this.displayDpoEditButton = true;
      }

      if (this._piaService.pia.concerned_people_searched_opinion !== undefined) {
        this.searchedOpinionsForm.controls['searchStatus'].patchValue(this._piaService.pia.concerned_people_searched_opinion);
        this.searchedOpinionsForm.controls['searchStatus'].disable();
        this.displayPeopleEditButton = true;
        if (this._piaService.pia.concerned_people_searched_opinion === true) {
          this.displayPeopleOpinions = true;
          this.displayPeopleSearchContent = false;
        } else {
          this.displayPeopleOpinions = false;
          this.displayPeopleSearchContent = true;
        }
      }

      if (this._piaService.pia.concerned_people_searched_content && this._piaService.pia.concerned_people_searched_content.length > 0) {
        this.searchedOpinionsForm.controls['searchContent'].patchValue(this._piaService.pia.concerned_people_searched_content);
        this.searchedOpinionsForm.controls['searchContent'].disable();
        this.displayPeopleEditButton = true;
      }

      if (this._piaService.pia.people_names && this._piaService.pia.people_names.length > 0) {
        this.peopleForm.controls['peopleNames'].patchValue(this._piaService.pia.people_names);
        this.peopleForm.controls['peopleNames'].disable();
        this.displayPeopleEditButton = true;
      } else {
        this.peopleForm.controls['peopleStatus'].disable();
        this.peopleForm.controls['peopleOpinion'].disable();
      }
      if (this._piaService.pia.concerned_people_status !== undefined) {
        this.peopleForm.controls['peopleStatus'].patchValue(this._piaService.pia.concerned_people_status);
        this.peopleForm.controls['peopleStatus'].disable();
        this.displayPeopleEditButton = true;
      }
      if (this._piaService.pia.concerned_people_opinion && this._piaService.pia.concerned_people_opinion.length > 0) {
        this.peopleForm.controls['peopleOpinion'].patchValue(this._piaService.pia.concerned_people_opinion);
        this.peopleForm.controls['peopleOpinion'].disable();
        this.displayPeopleEditButton = true;
      }

      if (this._piaService.pia.status >= 2) {
        this.DPOForm.disable();
        this.peopleForm.disable();
        this.displayPeopleEditButton = false;
        this.displayDpoEditButton = false;
      }

      // Textareas auto resize
      const DPOTextarea = document.getElementById('pia-opinions-dpo');
      if (DPOTextarea) {
        this.autoTextareaResize(null, DPOTextarea);
      }
      const peopleTextarea = document.getElementById('pia-opinions-people');
      if (peopleTextarea) {
        this.autoTextareaResize(null, peopleTextarea);
      }
    });
  }

  // DPO methods

  /**
   * Disables DPO fields (status + opinion) and saves data.
   */
  DPOFocusOutNames() {
    if (this.DPOForm.value.DPONames && this.DPOForm.value.DPONames.length > 0) {
      this._piaService.pia.dpos_names = this.DPOForm.value.DPONames;
      this.DPOForm.enable();
      this.DPOForm.controls['DPONames'].disable();
    } else {
      this.displayDpoEditButton = false;
      this._piaService.pia.dpos_names = null;
      this._piaService.pia.dpo_status = null;
      this._piaService.pia.dpo_opinion = null;
      this.DPOForm.controls['DPOOpinion'].patchValue(null);
      this.DPOForm.controls['DPONames'].patchValue(null);
      this.DPOForm.controls['DPOStatus'].patchValue(null);
    }
    this._piaService.pia.update().then(() => {
      this.checkIfDpoOk();
    });
  }

  DPOFocusOutStatus() {
    if (this.DPOForm.value.DPOStatus && this.DPOForm.value.DPOStatus >= 0) {
      this._piaService.pia.dpo_status = parseInt(this.DPOForm.value.DPOStatus, 10);
      this.displayDpoEditButton = true;
      this._piaService.pia.update().then(() => {
        this.checkIfDpoOk();
      });
      this.DPOForm.controls['DPOStatus'].disable();
    }
  }

  // TODO faire en sorte que l'on puisse remettre le champs à vide (qu'il update avec une string vide ou undefined)
  DPOFocusOutOpinion() {
    if (this.DPOForm.value.DPOOpinion && this.DPOForm.value.DPOOpinion.length > 0) {
      this._piaService.pia.dpo_opinion = this.DPOForm.value.DPOOpinion;
      this.displayDpoEditButton = true;
      this._piaService.pia.update().then(() => {
        this.checkIfDpoOk();
      });
      this.DPOForm.controls['DPOOpinion'].disable();
    }
  }

  /**
   * Activates DPO fields (status + opinion).
   */
  activateDPOEdition() {
    this.displayDpoEditButton = false;
    this.DPOForm.enable();
  }

  // Concerned people opinion searched or unsearched methods

  searchedOpinionsFocusOut() {
    if (this.searchedOpinionsForm.value.searchStatus) {
      if (this.searchedOpinionsForm.value.searchStatus === 'true') {
        this._piaService.pia.concerned_people_searched_opinion = true;
        this.displayPeopleOpinions = true;
        this.displayPeopleSearchContent = false;
      } else if (this.searchedOpinionsForm.value.searchStatus === 'false') {
        this._piaService.pia.concerned_people_searched_opinion = false;
        this.displayPeopleOpinions = false;
        this.displayPeopleSearchContent = true;
      }
      this.displayPeopleEditButton = true;
      this._piaService.pia.update().then(() => {
        this.checkIfDpoOk();
      });
      this.searchedOpinionsForm.controls['searchStatus'].disable();
    }
  }

  // TODO faire en sorte que l'on puisse remettre le champs à vide (qu'il update avec une string vide ou undefined)
  peopleSearchContentFocusOut() {
    if (this.searchedOpinionsForm.value.searchContent && this.searchedOpinionsForm.value.searchContent.length > 0) {
      this._piaService.pia.concerned_people_searched_content = this.searchedOpinionsForm.value.searchContent;
      this.displayPeopleEditButton = true;
      this._piaService.pia.update().then(() => {
        this.checkIfDpoOk();
      });
      this.searchedOpinionsForm.controls['searchContent'].disable();
    }
  }

  // Concerned people methods

  /**
   * Disables people fields (status + opinion) and saves data.
   */
  peopleFocusOutNames() {
    if (this.peopleForm.value.peopleNames && this.peopleForm.value.peopleNames.length > 0) {
      this._piaService.pia.people_names = this.peopleForm.value.peopleNames;
      this.peopleForm.enable();
      this.peopleForm.controls['peopleNames'].disable();
    } else {
      this.displayPeopleEditButton = false;
      this._piaService.pia.people_names = null;
      this._piaService.pia.concerned_people_status = null;
      this._piaService.pia.concerned_people_opinion = null;
      this.peopleForm.controls['peopleOpinion'].patchValue(null);
      this.peopleForm.controls['peopleNames'].patchValue(null);
      this.peopleForm.controls['peopleStatus'].patchValue(null);
    }
    this._piaService.pia.update().then(() => {
      this.checkIfDpoOk();
    });
  }

  peopleFocusOutStatus() {
    if (this.peopleForm.value.peopleStatus && this.peopleForm.value.peopleStatus >= 0) {
      this._piaService.pia.concerned_people_status = parseInt(this.peopleForm.value.peopleStatus, 10);
      this.displayPeopleEditButton = true;
      this._piaService.pia.update().then(() => {
        this.checkIfDpoOk();
      });
      this.peopleForm.controls['peopleStatus'].disable();
      this.searchedOpinionsForm.disable();
    }
  }

  // TODO faire en sorte que l'on puisse remettre le champs à vide (qu'il update avec une string vide ou undefined)
  peopleFocusOutOpinion() {
    if (this.peopleForm.value.peopleOpinion && this.peopleForm.value.peopleOpinion.length > 0) {
      this._piaService.pia.concerned_people_opinion = this.peopleForm.value.peopleOpinion;
      this.displayPeopleEditButton = true;
      this._piaService.pia.update().then(() => {
        this.checkIfDpoOk();
      });
      this.peopleForm.controls['peopleOpinion'].disable();
    }
  }

  /**
   * Activates people fields (status + opinion).
   */
  activatePeopleEdition() {
    this.displayPeopleEditButton = false;
    this.searchedOpinionsForm.enable();
    this.peopleForm.enable();
  }

  // Misc methods

  autoTextareaResize(event: any, textarea: HTMLElement) {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height = (textarea.scrollHeight * 2 - textarea.clientHeight) + 'px';
      }
    }
  }

  checkDpoName() {
    if (!this.DPOForm.controls['DPONames'].value) {
      this.elementRef1.nativeElement.focus();
      this.DPOForm.controls['DPOStatus'].disable();
      this.DPOForm.controls['DPOOpinion'].disable();
    }
  }

  checkConcernedPeopleName() {
    if (!this.peopleForm.controls['peopleNames'].value) {
      this.elementRef2.nativeElement.focus();
      this.peopleForm.controls['peopleStatus'].patchValue(null);
      this.peopleForm.controls['peopleOpinion'].patchValue(null);
    }
  }

  private checkIfDpoOk() {
    // Check if at least one field has been filled before executing anything
    if (this._piaService.pia.dpos_names
        || this._piaService.pia.dpo_status
        || this._piaService.pia.dpo_opinion
        || this._piaService.pia.concerned_people_searched_opinion === true
        || this._piaService.pia.concerned_people_searched_opinion === false) {
          let dpoFilled = false;
          let concernedPeopleOpinionSearchedFieldsFilled = false;
          let concernedPeopleOpinionUnsearchedFieldsFilled = false;

          // Edition enabled
          this._sidStatusService['itemStatus']['4.3'] = 1;

          // All DPO fields filled = OK
          if (this._piaService.pia.dpos_names
            && this._piaService.pia.dpos_names.length > 0
            && this._piaService.pia.dpo_status !== undefined
            && this._piaService.pia.dpo_status !== null
            && this._piaService.pia.dpo_opinion
            && this._piaService.pia.dpo_opinion.length > 0) {
              dpoFilled = true;
          }

          // Concerned people opinion unsearched + no search reason field filled = OK
          if (this._piaService.pia.concerned_people_searched_opinion === false) {

            if (this._piaService.pia.concerned_people_searched_content
                && this._piaService.pia.concerned_people_searched_content.length > 0) {
                  concernedPeopleOpinionUnsearchedFieldsFilled = true;
            }
          }

          // Concerned people opinion searched + name(s) + status + opinions = OK :
          if (this._piaService.pia.concerned_people_searched_opinion === true) {
            if (this._piaService.pia.people_names
                && this._piaService.pia.people_names.length > 0
                && this._piaService.pia.concerned_people_status !== undefined
                && this._piaService.pia.concerned_people_status !== null
                && this._piaService.pia.concerned_people_opinion
                && this._piaService.pia.concerned_people_opinion.length > 0) {
                  concernedPeopleOpinionSearchedFieldsFilled = true;
            }
          }

          // Treatment which validates the subsection if everything is OK
          // DPO filled + unsearched opinion scenario filled OR DPO filled + searched opinion scenario filled
          if ((dpoFilled === true && concernedPeopleOpinionUnsearchedFieldsFilled === true)
              || (dpoFilled === true && concernedPeopleOpinionSearchedFieldsFilled === true)) {
            this._sidStatusService['itemStatus']['4.3'] = 2;
          }

    } else {
      this._sidStatusService['itemStatus']['4.3'] = 0;
    }
  }

}
