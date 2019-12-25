import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Structure } from 'src/app/structures/structure.model';

import { ModalsService } from 'src/app/modals/modals.service';
import { StructureService } from 'src/app/services/structure.service';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: [
    './card-item.component.scss',
    './card-item_edit.component.scss',
    './card-item_doing.component.scss'
  ],
  providers: [StructureService]
})
export class CardItemComponent implements OnInit {
  @Input() structure: any;
  @Input() previousStructure: any;
  @Output() structEvent = new EventEmitter<Structure>();
  structureForm: FormGroup;

  @ViewChild('structureName', { static: true })
  private structureName: ElementRef;
  @ViewChild('structureSectorName', { static: true })
  private structureSectorName: ElementRef;

  constructor(
    private router: Router,
    private _modalsService: ModalsService,
    public _structureService: StructureService,
    public _languagesService: LanguagesService
  ) {}

  ngOnInit() {
    this.structureForm = new FormGroup({
      id: new FormControl(this.structure.id),
      name: new FormControl({
        value: this.structure.name,
        disabled: this.structure.is_example
      }),
      sector_name: new FormControl({
        value: this.structure.sector_name,
        disabled: this.structure.is_example
      })
    });
  }

  /**
   * Focuses Structure name field.
   */
  structureNameFocusIn() {
    if (this.structure.is_example) {
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
      this.structure.name = this.structureForm.value.name;
      this.structure.update();
      this.structEvent.emit(this.structure);
    }
  }

  /**
   * Focuses Structure author name field.
   */
  structureSectorNameFocusIn() {
    if (this.structure.is_example) {
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
      this.structure.sector_name = this.structureForm.value.sector_name;
      this.structure.update();
      this.structEvent.emit(this.structure);
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
    this._structureService
      .duplicateStructure(id)
      .then((structure: Structure) => {
        this.structEvent.emit(structure);
      });
  }
}
