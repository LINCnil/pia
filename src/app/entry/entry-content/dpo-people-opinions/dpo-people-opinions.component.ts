import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Pia } from 'app/entry/pia.model';

import { SidStatusService } from 'app/services/sid-status.service';
import { PiaService } from 'app/services/pia.service';

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
  displayPeopleOpinions = false;
  displayPeopleSearchContent = false;
  @ViewChild('DpoNames') private elementRef1: ElementRef;
  @ViewChild('PeopleNames') private elementRef2: ElementRef;

  constructor(private el: ElementRef,
              public _sidStatusService: SidStatusService,
              public _piaService: PiaService) { }

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
      // DPO
      if (this._piaService.pia.dpos_names && this._piaService.pia.dpos_names.length > 0) {
        this.DPOForm.controls['DPONames'].patchValue(this._piaService.pia.dpos_names);
        this.DPOForm.controls['DPONames'].disable();
      } else {
        this.DPOForm.controls['DPOStatus'].disable();
        this.DPOForm.controls['DPOOpinion'].disable();
      }
      if (this._piaService.pia.dpo_status !== undefined) {
        this.DPOForm.controls['DPOStatus'].patchValue(this._piaService.pia.dpo_status);
      }
      if (this._piaService.pia.dpo_opinion && this._piaService.pia.dpo_opinion.length > 0) {
        this.DPOForm.controls['DPOOpinion'].patchValue(this._piaService.pia.dpo_opinion);
        this.DPOForm.controls['DPOOpinion'].disable();
      }

      // Concerned people opinion searched or unsearched
      if (this._piaService.pia.concerned_people_searched_opinion !== undefined) {
        this.searchedOpinionsForm.controls['searchStatus'].patchValue(this._piaService.pia.concerned_people_searched_opinion);
        if (this._piaService.pia.concerned_people_searched_opinion === true) {
          this.displayPeopleOpinions = true;
          this.displayPeopleSearchContent = false;
        } else {
          this.displayPeopleOpinions = false;
          this.displayPeopleSearchContent = true;
        }
      }

      // Concerned people unsearched field
      if (this._piaService.pia.concerned_people_searched_content && this._piaService.pia.concerned_people_searched_content.length > 0) {
        this.searchedOpinionsForm.controls['searchContent'].patchValue(this._piaService.pia.concerned_people_searched_content);
        this.searchedOpinionsForm.controls['searchContent'].disable();
      }

      // Concerned people searched fields
      if (this._piaService.pia.people_names && this._piaService.pia.people_names.length > 0) {
        this.peopleForm.controls['peopleNames'].patchValue(this._piaService.pia.people_names);
        this.peopleForm.controls['peopleNames'].disable();
      } else {
        this.peopleForm.controls['peopleStatus'].disable();
        this.peopleForm.controls['peopleOpinion'].disable();
      }
      if (this._piaService.pia.concerned_people_status !== undefined) {
        this.peopleForm.controls['peopleStatus'].patchValue(this._piaService.pia.concerned_people_status);
      }
      if (this._piaService.pia.concerned_people_opinion && this._piaService.pia.concerned_people_opinion.length > 0) {
        this.peopleForm.controls['peopleOpinion'].patchValue(this._piaService.pia.concerned_people_opinion);
        this.peopleForm.controls['peopleOpinion'].disable();
      }

      if (this._piaService.pia.status >= 2) {
        this.DPOForm.disable();
        this.peopleForm.disable();
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

  /**
   * Focuses dpo name.
   * @memberof DPOPeopleOpinionsComponent
   */
  dpoNameFocusIn() {
    if (this._piaService.pia.status >= 2 || this._piaService.pia.is_example === 1) {
      return false;
    } else {
      this.DPOForm.controls['DPONames'].enable();
      this.elementRef1.nativeElement.focus();
    }
  }

  /**
   * Disables DPO fields (status + opinion) and saves data.
   * @memberof DPOPeopleOpinionsComponent
   */
  dpoNameFocusOut() {
    if (this.DPOForm.value.DPONames && this.DPOForm.value.DPONames.length > 0) {
      this._piaService.pia.dpos_names = this.DPOForm.value.DPONames;
      this.DPOForm.enable();
    } else {
      this._piaService.pia.dpos_names = null;
      this._piaService.pia.dpo_status = null;
      this._piaService.pia.dpo_opinion = null;
      this.DPOForm.controls['DPONames'].patchValue(null);
      this.DPOForm.controls['DPOStatus'].patchValue(null);
      this.DPOForm.controls['DPOOpinion'].patchValue(null);
    }
    this._piaService.pia.update().then(() => {
      this._sidStatusService.setSidStatus(this._piaService, { id: 4 }, { id: 3 });
      if (this.DPOForm.value.DPONames && this.DPOForm.value.DPONames.length > 0) {
        this.DPOForm.controls['DPONames'].disable();
      }
    });
  }

  /**
   * Enables dpo status radio buttons.
   * @memberof DPOPeopleOpinionsComponent
   */
  enableDpoStatusRadioButtons() {
    if (this._piaService.pia.status >= 2 || this._piaService.pia.is_example === 1) {
      return false;
    } else {
      this.DPOForm.controls['DPOStatus'].enable();
    }
  }

  /**
   * Updates dpo status.
   * @memberof DPOPeopleOpinionsComponent
   */
  dpoStatusFocusOut() {
    this._piaService.pia.dpo_status = parseInt(this.DPOForm.value.DPOStatus, 10);
    this._piaService.pia.update().then(() => {
      this._sidStatusService.setSidStatus(this._piaService, { id: 4 }, { id: 3 });
    });
  }

  /**
   * Focuses dpo opinion.
   * @memberof DPOPeopleOpinionsComponent
   */
  dpoOpinionFocusIn() {
    if (this._piaService.pia.status >= 2 || this._piaService.pia.is_example === 1) {
      return false;
    } else {
      this.DPOForm.controls['DPOOpinion'].enable();
      document.getElementById('pia-opinions-dpo').focus();
    }
  }

  /**
   * Updates dpo opinion.
   * @memberof DPOPeopleOpinionsComponent
   */
  dpoOpinionFocusOut() {
    let userText = this.DPOForm.controls['DPOOpinion'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this._piaService.pia.dpo_opinion = userText;
    this._piaService.pia.update().then(() => {
      this._sidStatusService.setSidStatus(this._piaService, { id: 4 }, { id: 3 });
      if (userText && userText.length > 0) {
        this.DPOForm.controls['DPOOpinion'].disable();
      }
    });
  }

  /**
   * Enables concerned people searched or unsearched radio buttons.
   * @memberof DPOPeopleOpinionsComponent
   */
  enableConcernedPeopleSearchedOpinionRadioButtons() {
    if (this._piaService.pia.status >= 2 || this._piaService.pia.is_example === 1) {
      return false;
    } else {
      this.searchedOpinionsForm.controls['searchStatus'].enable();
    }
  }

  /**
   * Updates concerned people searched or unsearched opinion.
   * @memberof DPOPeopleOpinionsComponent
   */
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
      this._piaService.pia.update().then(() => {
        this._sidStatusService.setSidStatus(this._piaService, { id: 4 }, { id: 3 });
      });
    }
  }

  /**
   * Focuses concerned people search content.
   * @memberof DPOPeopleOpinionsComponent
   */
  peopleSearchContentFocusIn() {
    if (this._piaService.pia.status >= 2 || this._piaService.pia.is_example === 1) {
      return false;
    } else {
      this.searchedOpinionsForm.controls['searchContent'].enable();
      document.getElementById('pia-people-search-content').focus();
    }
  }

  /**
   * Updates concerned people search content.
   * @memberof DPOPeopleOpinionsComponent
   */
  peopleSearchContentFocusOut() {
    let userText = this.searchedOpinionsForm.controls['searchContent'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this._piaService.pia.concerned_people_searched_content = userText;
    this._piaService.pia.update().then(() => {
      this._sidStatusService.setSidStatus(this._piaService, { id: 4 }, { id: 3 });
      if (userText && userText.length > 0) {
        this.searchedOpinionsForm.controls['searchContent'].disable();
      }
    });
  }

  /**
   * Focuses concerned people name.
   * @memberof DPOPeopleOpinionsComponent
   */
  concernedPeopleNameFocusIn() {
    if (this._piaService.pia.status >= 2 || this._piaService.pia.is_example === 1) {
      return false;
    } else {
      this.peopleForm.controls['peopleNames'].enable();
      this.elementRef2.nativeElement.focus();
    }
  }

  /**
   * Updates concerned people name.
   * @memberof DPOPeopleOpinionsComponent
   */
  concernedPeopleNameFocusOut() {
    if (this.peopleForm.value.peopleNames && this.peopleForm.value.peopleNames.length > 0) {
      this._piaService.pia.people_names = this.peopleForm.value.peopleNames;
      this.peopleForm.enable();
    } else {
      this._piaService.pia.people_names = null;
      this._piaService.pia.concerned_people_status = null;
      this._piaService.pia.concerned_people_opinion = null;
      this.peopleForm.controls['peopleOpinion'].patchValue(null);
      this.peopleForm.controls['peopleNames'].patchValue(null);
      this.peopleForm.controls['peopleStatus'].patchValue(null);
    }
    this._piaService.pia.update().then(() => {
      this._sidStatusService.setSidStatus(this._piaService, { id: 4 }, { id: 3 });
      if (this.peopleForm.value.peopleNames && this.peopleForm.value.peopleNames.length > 0) {
        this.peopleForm.controls['peopleNames'].disable();
      }
    });
  }

  /**
   * Enables concerned people status radio buttons.
   * @memberof DPOPeopleOpinionsComponent
   */
  enableConcernedPeopleStatusRadioButtons() {
    if (this._piaService.pia.status >= 2 || this._piaService.pia.is_example === 1) {
      return false;
    } else {
      this.peopleForm.controls['peopleStatus'].enable();
    }
  }

  /**
   * Updates concerned people status.
   * @memberof DPOPeopleOpinionsComponent
   */
  concernedPeopleStatusFocusOut() {
    if (this.peopleForm.value.peopleStatus && this.peopleForm.value.peopleStatus >= 0) {
      this._piaService.pia.concerned_people_status = parseInt(this.peopleForm.value.peopleStatus, 10);
      this._piaService.pia.update().then(() => {
        this._sidStatusService.setSidStatus(this._piaService, { id: 4 }, { id: 3 });
      });
    }
  }

  /**
   * Focuses concerned people opinion field.
   * @memberof DPOPeopleOpinionsComponent
   */
  concernedPeopleOpinionFocusIn() {
    if (this._piaService.pia.status >= 2 || this._piaService.pia.is_example === 1) {
      return false;
    } else {
      this.peopleForm.controls['peopleOpinion'].enable();
      document.getElementById('pia-opinions-people').focus();
    }
  }

  /**
   * Updates concerned people opinion.
   * @memberof DPOPeopleOpinionsComponent
   */
  concernedPeopleopinionFocusOut() {
    let userText = this.peopleForm.controls['peopleOpinion'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this._piaService.pia.concerned_people_opinion = userText;
    this._piaService.pia.update().then(() => {
      this._sidStatusService.setSidStatus(this._piaService, { id: 4 }, { id: 3 });
      if (userText && userText.length > 0) {
        this.peopleForm.controls['peopleOpinion'].disable();
      }
    });
  }

  /**
   * Auto textarea resize.
   * @param {*} event - Any Event.
   * @param {HTMLElement} [textarea] - Textarea HTML element.
   * @memberof DPOPeopleOpinionsComponent
   */
  autoTextareaResize(event: any, textarea?: HTMLElement) {
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

  /**
   * Checks if dpo name is filled to enable other fields.
   * @memberof DPOPeopleOpinionsComponent
   */
  checkDpoName() {
    if (!this.DPOForm.controls['DPONames'].value) {
      this.elementRef1.nativeElement.focus();
      this.DPOForm.controls['DPOStatus'].disable();
      this.DPOForm.controls['DPOOpinion'].disable();
      this.DPOForm.controls['DPOStatus'].patchValue(null);
      this.DPOForm.controls['DPOOpinion'].patchValue(null);
    }
  }

  /**
   * Checks if concerned people name is filled to enable other fields.
   * @memberof DPOPeopleOpinionsComponent
   */
  checkConcernedPeopleName() {
    if (!this.peopleForm.controls['peopleNames'].value) {
      this.elementRef2.nativeElement.focus();
      this.peopleForm.controls['peopleStatus'].disable();
      this.peopleForm.controls['peopleOpinion'].disable();
      this.peopleForm.controls['peopleStatus'].patchValue(null);
      this.peopleForm.controls['peopleOpinion'].patchValue(null);
    }
  }
}
