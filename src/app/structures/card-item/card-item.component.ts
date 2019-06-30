import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Structure } from 'src/app/structures/structure.model';

import { ModalsService } from 'src/app/modals/modals.service';
import { StructureService } from 'src/app/services/structure.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss', './card-item_doing.component.scss'],
  providers: [StructureService]
})
export class CardItemComponent implements OnInit {
  @Input() structure: any;
  @Input() previousStructure: any;
  @Output() structEvent = new EventEmitter<Structure>();
  structureForm: FormGroup;

  @ViewChild('structureName') private structureName: ElementRef;
  @ViewChild('structureSectorName') private structureSectorName: ElementRef;

  constructor(private router: Router,
              private _modalsService: ModalsService,
              public _structureService: StructureService,
              private _languagesService: LanguagesService,
              private _translateService: TranslateService) { }

  ngOnInit() {
    this.structureForm = new FormGroup({
      id: new FormControl(this.structure.id),
      name: new FormControl({ value: this.structure.name, disabled: false }),
      sector_name: new FormControl({ value: this.structure.sector_name, disabled: false })
    });
  }

  /**
   * Focuses Structure name field.
   */
  structureNameFocusIn() {
    if (this._structureService.structure.is_example) {
      return;
    }
    this.structureForm.controls['name'].enable();
    this.structureName.nativeElement.focus();
  }

  /**
   * Disables Structure name field and saves data.
   */
  structureNameFocusOut() {
    let userText = this.structureForm.controls['name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      const structure = new Structure();
      structure.get(this.structureForm.value.id).then(() => {
        structure.name = this.structureForm.value.name;
        structure.update();
      });
    }
  }

  /**
   * Focuses Structure author name field.
   */
  structureSectorNameFocusIn() {
    if (this._structureService.structure.is_example) {
      return;
    }
    this.structureSectorName.nativeElement.focus();
  }

  /**
   * Disables Structure author name field and saves data.
   */
  structureSectorNameFocusOut() {
    let userText = this.structureForm.controls['sector_name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      const structure = new Structure();
      structure.get(this.structureForm.value.id).then(() => {
        structure.sector_name = this.structureForm.value.sector_name;
        structure.update();
      });
    }
  }

  /**
   * Deletes a Structure with a given id.
   * @param {string} id - The Structure id.
   */
  remove(id: string) {
    localStorage.setItem('structure-id', id);
    this._modalsService.openModal('modal-remove-structure');
  }

  /**
   * Export a Structure in JSON format.
   * @param {number} id - The Structure id.
   */
  export(id: number) {
    this._structureService.exportStructure(id);
  }

  /**
   *
   * @param id structure ID
   */
  async duplicate(id: number) {
    this._structureService.duplicateStructure(id).then((structure: Structure) => {
      this.structEvent.emit(structure);
    });
  }
}
