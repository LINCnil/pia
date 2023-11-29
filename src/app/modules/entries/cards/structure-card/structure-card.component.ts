import {
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Structure } from 'src/app/models/structure.model';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { PiaService } from 'src/app/services/pia.service';
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
  @Output() deleted = new EventEmitter<Structure>();
  structureForm: UntypedFormGroup;

  @ViewChild('structureName')
  structureName: ElementRef;
  @ViewChild('structureSectorName')
  private structureSectorName: ElementRef;

  constructor(
    private piaService: PiaService,
    public structureService: StructureService,
    public languagesService: LanguagesService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.structureForm = new UntypedFormGroup({
      id: new UntypedFormControl(this.structure.id),
      name: new UntypedFormControl({
        value: this.structure.name,
        disabled: this.structure.is_example
      }),
      sector_name: new UntypedFormControl({
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
      this.structureService.update(this.structure).then(() => {
        this.changed.emit(this.structure);
      });
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
      this.structureService
        .update(this.structure)
        .then(() => {
          this.changed.emit(this.structure);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  /**
   * Opens the modal to confirm deletion of a Structure
   * @param id - The Structure id.
   */
  remove(id: number): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.remove_structure.content',
        type: 'confirm',
        yes: 'modals.remove_structure.remove',
        no: 'modals.cancel',
        icon: 'pia-icons pia-icon-sad',
        data: {
          btn_yes: 'btn-red'
        }
      },
      () => {
        this.structureService
          .remove(id)
          .then(() => {
            this.piaService.getAllWithStructure(id).then((items: any) => {
              items.forEach(item => {
                item.structure_id = null;
                this.piaService.update(item);
              });
              this.deleted.emit();
            });
          })
          .catch(() => {
            return;
          });
      },
      () => {
        return;
      }
    );
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
