import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

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
  DPOForm: UntypedFormGroup;
  searchedOpinionsForm: UntypedFormGroup;
  peopleForm: UntypedFormGroup;
  displayPeopleOpinions = false;
  displayPeopleSearchContent = false;
  @ViewChild('DpoNames', { static: false }) private elementRef1: ElementRef;
  @ViewChild('PeopleNames', { static: false }) private elementRef2: ElementRef;

  constructor(
    public _sidStatusService: SidStatusService,
    public _piaService: PiaService
  ) {}

  ngOnInit(): void {
    // DPO Form init
    this.DPOForm = new UntypedFormGroup({
      DPOStatus: new UntypedFormControl(this.pia.dpo_status),
      DPOOpinion: new UntypedFormControl(this.pia.dpo_opinion),
      DPONames: new UntypedFormControl(this.pia.dpos_names)
    });

    if (!this.pia.dpos_names) {
      this.DPOForm.controls.DPOStatus.disable();
      this.DPOForm.controls.DPOOpinion.disable();
    }

    // Searched opinions form  init
    this.searchedOpinionsForm = new UntypedFormGroup({
      searchStatus: new UntypedFormControl(
        this.pia.concerned_people_searched_opinion
      ),
      searchContent: new UntypedFormControl(
        this.pia.concerned_people_searched_content
      )
    });

    if (this.pia.concerned_people_searched_opinion !== undefined) {
      this.displayPeopleOpinions = this.pia.concerned_people_searched_opinion;
      this.displayPeopleSearchContent = !this.pia
        .concerned_people_searched_opinion;
    }

    // peopleForm form  init
    this.peopleForm = new UntypedFormGroup({
      peopleStatus: new UntypedFormControl(this.pia.concerned_people_status),
      peopleOpinion: new UntypedFormControl(this.pia.concerned_people_opinion),
      peopleNames: new UntypedFormControl(this.pia.people_names)
    });

    if (!this.pia.people_names) {
      this.peopleForm.controls.peopleStatus.disable();
      this.peopleForm.controls.peopleOpinion.disable();
    }

    if (!this.editMode.includes('evaluator') && this.editMode != 'local') {
      this.DPOForm.disable();
      this.searchedOpinionsForm.disable();
      this.peopleForm.disable();
    }

    // OBSERVABLES
    this.DPOForm.controls.DPONames.valueChanges.subscribe(data => {
      if (data) {
        if (this.editMode.includes('evaluator') || this.editMode == 'local') {
          this.DPOForm.controls.DPOStatus.enable();
          this.DPOForm.controls.DPOOpinion.enable();
        }
      } else {
        this.DPOForm.controls.DPOStatus.disable();
        this.DPOForm.controls.DPOOpinion.disable();
        this.DPOForm.controls.DPOStatus.patchValue(null);
        this.DPOForm.controls.DPOOpinion.patchValue(null);
      }
    });

    this.searchedOpinionsForm.controls.searchStatus.valueChanges.subscribe(
      data => {
        this.displayPeopleOpinions = data;
        this.displayPeopleSearchContent = !data;

        if (data) {
          this.searchedOpinionsForm.controls.searchContent.patchValue(null);
        } else {
          this.peopleForm.controls.peopleNames.patchValue(null);
          this.peopleForm.controls.peopleStatus.patchValue(null);
          this.peopleForm.controls.peopleOpinion.patchValue(null);
        }

        // Check user role
        if (!this.editMode.includes('evaluator') && this.editMode != 'local') {
          this.searchedOpinionsForm.disable();
          this.peopleForm.disable();
        }
      }
    );

    // OTHERS RULES
    if (this.pia.status >= 2 || this.pia.is_example === 1) {
      this.DPOForm.disable();
      this.searchedOpinionsForm.disable();
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
   * Disables DPO fields (status + opinion) and saves data.
   */
  dpoNameFocusOut(): void {
    this.pia.dpos_names = this.DPOForm.value.DPONames;
    this.pia.dpo_status = this.DPOForm.value.DPOStatus
      ? parseInt(this.DPOForm.value.DPOStatus, 10)
      : null;
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
    });
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
    });
  }

  /**
   * Updates concerned people searched or unsearched opinion.
   */
  searchedOpinionsFocusOut() {
    this.pia.concerned_people_searched_opinion = this.searchedOpinionsForm.value.searchStatus;
    let userText = this.searchedOpinionsForm.controls['searchContent'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    if (!this.pia.concerned_people_searched_opinion) {
      this.pia.people_names = null;
      this.pia.concerned_people_status = null;
      this.pia.concerned_people_opinion = null;
    }

    this.pia.concerned_people_searched_content = userText;
    this._piaService.update(this.pia).then(dataUpdated => {
      if (dataUpdated.lock_version) {
        // Update lock_version
        this.pia.lock_version = dataUpdated.lock_version;
      }
      this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
    });
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
    });
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

      // TODO: GO to a subscribe method
      this.peopleForm.controls.peopleOpinion.disable();
      this.peopleForm.controls.peopleStatus.disable();
      this.peopleForm.controls.peopleOpinion.patchValue(null);
      this.peopleForm.controls.peopleStatus.patchValue(null);
    }

    this._piaService.update(this.pia).then((dataUpdated: Pia) => {
      if (dataUpdated.lock_version) {
        // Update lock_version
        this.pia.lock_version = dataUpdated.lock_version;
      }
      this._sidStatusService.setSidStatus(this.pia, { id: 4 }, { id: 3 });
    });
  }

  /**
   * Updates concerned people status.
   */
  concernedPeopleStatusFocusOut() {
    this.pia.concerned_people_status = this.peopleForm.value.peopleStatus
      ? parseInt(this.peopleForm.value.peopleStatus, 10)
      : 0;

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
    });
  }

  /**
   * Auto textarea resize.
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

  changeFocusIfDisable(inputClass) {
    switch (inputClass) {
      case 'DPOName':
        console.log(this.DPOForm.controls.DPONames.value);
        if (!this.DPOForm.controls.DPONames.value) {
          let input: HTMLInputElement = document.querySelector(
            `input.${inputClass}`
          );
          input.focus();
        }
        break;
      case 'peopleNames':
        console.log(this.peopleForm.controls.peopleNames.value);
        if (!this.peopleForm.controls.peopleNames.value) {
          let input: HTMLInputElement = document.querySelector(
            `input.${inputClass}`
          );
          input.focus();
        }
        break;
    }
  }
}
