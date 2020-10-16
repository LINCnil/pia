import { ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Structure } from 'src/app/models/structure.model';
import { LanguagesService } from 'src/app/services/languages.service';
import { ModalsService } from 'src/app/services/modals.service';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-structure-card',
  templateUrl: './structure-card.component.html',
  styleUrls: ['./structure-card.component.scss']
})
export class StructureCardComponent implements OnInit {
  @Input() structure: any;
  @Input() previousStructure: any;
  @Output() changed = new EventEmitter<Structure>();
  @Output() duplicated = new EventEmitter<Structure>();
  structureForm: FormGroup;

  @ViewChild('structureName', { static: true })
  private structureName: ElementRef;
  @ViewChild('structureSectorName', { static: true })
  private structureSectorName: ElementRef;

  constructor(
    private router: Router,
    private modalsService: ModalsService,
    public structureService: StructureService,
    public languagesService: LanguagesService
  ) { }

  ngOnInit(): void {
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
  structureNameFocusIn(): void {
    if (this.structure.is_example) {
      return;
    }
    this.structureForm.controls['name'].enable();
    this.structureName.nativeElement.focus();
  }

  /**
   * Disables Structure name field and saves data.
   */
  structureNameFocusOut(): void {
    let userText = this.structureForm.controls['name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.structure.name = this.structureForm.value.name;
      this.structure.update();
      this.changed.emit(this.structure);
    }
  }

  /**
   * Focuses Structure author name field.
   */
  structureSectorNameFocusIn(): void {
    if (this.structure.is_example) {
      return;
    }
    this.structureSectorName.nativeElement.focus();
  }

  /**
   * Disables Structure author name field and saves data.
   */
  structureSectorNameFocusOut(): void {
    let userText = this.structureForm.controls['sector_name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.structure.sector_name = this.structureForm.value.sector_name;
      this.structure.update();
      this.changed.emit(this.structure);
    }
  }

  /**
   * Deletes a Structure with a given id.
   * @param id - The Structure id.
   */
  remove(id: string): void {
    localStorage.setItem('structure-id', id);
    this.modalsService.openModal('modal-remove-structure');
  }

  /**
   * Export a Structure in JSON format.
   * @param id - The Structure id.
   */
  export(id: number): void {
    this.structureService.exportStructure(id);
  }

  /**
   *
   * @param id structure ID
   */
  async duplicate(id: number): Promise<void> {
    this.structureService
      .duplicateStructure(id)
      .then((structure: Structure) => {
        this.duplicated.emit(structure);
      });
  }

}
