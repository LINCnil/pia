import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { SidStatusService } from 'src/app/services/sid-status.service';
import { PiaService } from 'src/app/services/pia.service';
import { Pia } from 'src/app/models/pia.model';

@Component({
  selector: 'app-dpo-people-opinions',
  templateUrl: './dpo-people-opinions.component.html',
  styleUrls: ['./dpo-people-opinions.component.scss']
})
export class DPOPeopleOpinionsComponent implements OnInit {
  @Input() pia: Pia;
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
  DPOForm: FormGroup;
  searchedOpinionsForm: FormGroup;
  peopleForm: FormGroup;
  displayPeopleOpinions = false;
  displayPeopleSearchContent = false;
  @ViewChild('DpoNames', { static: false }) private elementRef1: ElementRef;
  @ViewChild('PeopleNames', { static: false }) private elementRef2: ElementRef;

  constructor(
    public _sidStatusService: SidStatusService,
    public _piaService: PiaService
  ) {}

  ngOnInit(): void {
    this.DPOForm = new FormGroup({
      DPOStatus: new FormControl(this.pia.dpo_status),
      DPOOpinion: new FormControl(this.pia.dpo_opinion, null),
      DPONames: new FormControl(this.pia.dpos_names, null)
    });

    this.searchedOpinionsForm = new FormGroup({
      searchStatus: new FormControl(this.pia.concerned_people_searched_opinion),
      searchContent: new FormControl(this.pia.concerned_people_searched_content)
    });

    this.peopleForm = new FormGroup({
      peopleStatus: new FormControl(this.pia.concerned_people_status),
      peopleOpinion: new FormControl(this.pia.concerned_people_opinion),
      peopleNames: new FormControl(this.pia.people_names)
    });

    if (this.pia.dpos_names && this.pia.dpos_names.length > 0) {
      this.DPOForm.controls['DPONames'].disable();
    } else {
      this.DPOForm.controls['DPOStatus'].disable();
      this.DPOForm.controls['DPOOpinion'].disable();
    }

    if (this.pia.dpo_opinion && this.pia.dpo_opinion.length > 0) {
      this.DPOForm.controls['DPOOpinion'].disable();
    }

    // Concerned people opinion searched or unsearched
    if (
      this.pia.concerned_people_searched_opinion &&
      this.pia.concerned_people_searched_opinion !== undefined
    ) {
      if (this.pia.concerned_people_searched_opinion === true) {
        this.displayPeopleOpinions = true;
        this.displayPeopleSearchContent = false;
      } else {
        this.displayPeopleOpinions = false;
        this.displayPeopleSearchContent = true;
      }
    }

    // Concerned people unsearched field
    if (
      this.pia.concerned_people_searched_content &&
      this.pia.concerned_people_searched_content !== '' &&
      this.pia.concerned_people_searched_content.length > 0
    ) {
      this.searchedOpinionsForm.controls['searchContent'].disable();
    }

    // Concerned people searched fields
    if (this.pia.people_names && this.pia.people_names.length > 0) {
      this.peopleForm.controls['peopleNames'].disable();
    } else {
      this.peopleForm.controls['peopleStatus'].disable();
      this.peopleForm.controls['peopleOpinion'].disable();
    }

    if (
      this.pia.concerned_people_opinion &&
      this.pia.concerned_people_opinion != null &&
      this.pia.concerned_people_opinion.length > 0
    ) {
      this.peopleForm.controls['peopleOpinion'].disable();
    }

    if (this.pia.status >= 2) {
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
  }

  /**
   * Focuses dpo name.
   */
  dpoNameFocusIn(): any {
    if (
      this.pia.status >= 2 ||
      this.pia.is_example === 1 ||
      (!this.editMode.includes('evaluator') && this.editMode !== 'local')
    ) {
      return false;
    } else {
      this.DPOForm.controls['DPONames'].enable();
      this.elementRef1.nativeElement.focus();
    }
  }

  /**
   * Disables DPO fields (status + opinion) and saves data.
   */
  dpoNameFocusOut(): void {
    if (this.DPOForm.value.DPONames && this.DPOForm.value.DPONames.length > 0) {
      this.pia.dpos_names = this.DPOForm.value.DPONames;
      this.DPOForm.enable();
    } else {
      this.pia.dpos_names = null;
      this.pia.dpo_status = null;
      this.pia.dpo_opinion = null;
      this.DPOForm.controls['DPONames'].patchValue(null);
      this.DPOForm.controls['DPOStatus'].patchValue(null);
      this.DPOForm.controls['DPOOpinion'].patchValue(null);
    }
    this._piaService.update(this.pia).then(dataUpdated => {
      if (dataUpdated.lock_version) {
        // Update lock_version
        this.pia.lock_version = dataUpdated.lock_version;
      }
      this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
      if (
        this.DPOForm.value.DPONames &&
        this.DPOForm.value.DPONames.length > 0
      ) {
        this.DPOForm.controls['DPONames'].disable();
      }
    });
  }

  /**
   * Enables dpo status radio buttons.
   */
  enableDpoStatusRadioButtons(): any {
    if (this.pia.status >= 2 || this.pia.is_example === 1) {
      return false;
    } else {
      this.DPOForm.controls['DPOStatus'].enable();
    }
  }

  /**
   * Updates dpo status.
   */
  dpoStatusFocusOut(): void {
    this.pia.dpo_status = parseInt(this.DPOForm.value.DPOStatus, 10);
    this._piaService.update(this.pia).then(dataUpdated => {
      if (dataUpdated.lock_version) {
        // Update lock_version
        this.pia.lock_version = dataUpdated.lock_version;
      }
      this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
    });
  }

  /**
   * Focuses dpo opinion.
   */
  dpoOpinionFocusIn(): any {
    if (this.pia.status >= 2 || this.pia.is_example === 1) {
      return false;
    } else {
      this.DPOForm.controls['DPOOpinion'].enable();
      document.getElementById('pia-opinions-dpo').focus();
    }
  }

  /**
   * Updates dpo opinion.
   */
  dpoOpinionFocusOut(): void {
    let userText = this.DPOForm.controls['DPOOpinion'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.pia.dpo_opinion = userText;
    this._piaService.update(this.pia).then(dataUpdated => {
      if (dataUpdated.lock_version) {
        // Update lock_version
        this.pia.lock_version = dataUpdated.lock_version;
      }
      this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
      if (userText && userText.length > 0) {
        this.DPOForm.controls['DPOOpinion'].disable();
      }
    });
  }

  /**
   * Enables concerned people searched or unsearched radio buttons.
   */
  enableConcernedPeopleSearchedOpinionRadioButtons(): any {
    if (this.pia.status >= 2 || this.pia.is_example === 1) {
      return false;
    } else {
      this.searchedOpinionsForm.controls['searchStatus'].enable();
    }
  }

  /**
   * Updates concerned people searched or unsearched opinion.
   */
  searchedOpinionsFocusOut() {
    if (this.searchedOpinionsForm.value.searchStatus !== null) {
      if (this.searchedOpinionsForm.value.searchStatus) {
        this.pia.concerned_people_searched_opinion = true;
        this.displayPeopleOpinions = true;
        this.displayPeopleSearchContent = false;
      } else {
        this.pia.concerned_people_searched_opinion = false;
        this.displayPeopleOpinions = false;
        this.displayPeopleSearchContent = true;
      }
      this._piaService.update(this.pia).then(dataUpdated => {
        if (dataUpdated.lock_version) {
          // Update lock_version
          this.pia.lock_version = dataUpdated.lock_version;
        }
        this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
      });
    }
  }

  /**
   * Focuses concerned people search content.
   */
  peopleSearchContentFocusIn() {
    if (this.pia.status >= 2 || this.pia.is_example === 1) {
      return false;
    } else {
      this.searchedOpinionsForm.controls['searchContent'].enable();
      document.getElementById('pia-people-search-content').focus();
    }
  }

  /**
   * Updates concerned people search content.
   */
  peopleSearchContentFocusOut() {
    let userText = this.searchedOpinionsForm.controls['searchContent'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.pia.concerned_people_searched_content = userText;
    this._piaService.update(this.pia).then(dataUpdated => {
      if (dataUpdated.lock_version) {
        // Update lock_version
        this.pia.lock_version = dataUpdated.lock_version;
      }
      this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
      if (userText && userText.length > 0) {
        this.searchedOpinionsForm.controls['searchContent'].disable();
      }
    });
  }

  /**
   * Focuses concerned people name.
   */
  concernedPeopleNameFocusIn() {
    if (this.pia.status >= 2 || this.pia.is_example === 1) {
      return false;
    } else {
      this.peopleForm.controls['peopleNames'].enable();
      this.elementRef2.nativeElement.focus();
    }
  }

  /**
   * Updates concerned people name.
   */
  concernedPeopleNameFocusOut() {
    if (
      this.peopleForm.value.peopleNames &&
      this.peopleForm.value.peopleNames.length > 0
    ) {
      this.pia.people_names = this.peopleForm.value.peopleNames;
      this.peopleForm.enable();
    } else {
      this.pia.people_names = null;
      this.pia.concerned_people_status = null;
      this.pia.concerned_people_opinion = null;
      this.peopleForm.controls['peopleOpinion'].patchValue(null);
      this.peopleForm.controls['peopleNames'].patchValue(null);
      this.peopleForm.controls['peopleStatus'].patchValue(null);
    }

    this._piaService.update(this.pia).then((dataUpdated: Pia) => {
      if (dataUpdated.lock_version) {
        // Update lock_version
        this.pia.lock_version = dataUpdated.lock_version;
      }
      this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
      if (
        this.peopleForm.value.peopleNames &&
        this.peopleForm.value.peopleNames.length > 0
      ) {
        this.peopleForm.controls['peopleNames'].disable();
      }
    });
  }

  /**
   * Enables concerned people status radio buttons.
   */
  enableConcernedPeopleStatusRadioButtons() {
    if (this.pia.status >= 2 || this.pia.is_example === 1) {
      return false;
    } else {
      this.peopleForm.controls['peopleStatus'].enable();
    }
  }

  /**
   * Updates concerned people status.
   */
  concernedPeopleStatusFocusOut() {
    if (
      this.peopleForm.value.peopleStatus &&
      this.peopleForm.value.peopleStatus >= 0
    ) {
      this.pia.concerned_people_status = parseInt(
        this.peopleForm.value.peopleStatus,
        10
      );
      this._piaService
        .update(this.pia)
        .then(dataUpdated => {
          if (dataUpdated.lock_version) {
            // Update lock_version
            this.pia.lock_version = dataUpdated.lock_version;
          }
          this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
        })
        .catch(err => {});
    }
  }

  /**
   * Focuses concerned people opinion field.
   */
  concernedPeopleOpinionFocusIn() {
    if (this.pia.status >= 2 || this.pia.is_example === 1) {
      return false;
    } else {
      this.peopleForm.controls['peopleOpinion'].enable();
      document.getElementById('pia-opinions-people').focus();
    }
  }

  /**
   * Updates concerned people opinion.
   */
  concernedPeopleopinionFocusOut() {
    let userText = this.peopleForm.controls['peopleOpinion'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    this.pia.concerned_people_opinion = userText;
    this._piaService.update(this.pia).then(dataUpdated => {
      if (dataUpdated.lock_version) {
        // Update lock_version
        this.pia.lock_version = dataUpdated.lock_version;
      }
      this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
      if (userText && userText.length > 0) {
        this.peopleForm.controls['peopleOpinion'].disable();
      }
    });
  }

  /**
   * Auto textarea resize.
   * @param {*} event - Any Event.
   * @param {HTMLElement} [textarea] - Textarea HTML element.
   */
  autoTextareaResize(event: any, textarea?: HTMLElement) {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height =
          textarea.scrollHeight * 2 - textarea.clientHeight + 'px';
      }
    }
  }

  /**
   * Checks if dpo name is filled to enable other fields.
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
