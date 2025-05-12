import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Structure } from 'src/app/models/structure.model';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';
import {
  faEye,
  faPencil,
  faDownload,
  faFile,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-structure-line]',
  templateUrl: './structure-line.component.html',
  styleUrls: ['./structure-line.component.scss'],
  standalone: false
})
export class StructureLineComponent implements OnInit {
  @Input() structure: any;
  @Output() changed = new EventEmitter<Structure>();
  @Output() duplicated = new EventEmitter<Structure>();
  @Output() deleted = new EventEmitter<any>();

  protected readonly faEye = faEye;
  protected readonly faPencil = faPencil;
  protected readonly faDownload = faDownload;
  protected readonly faFile = faFile;
  protected readonly faTrash = faTrash;

  constructor(
    private piaService: PiaService,
    public structureService: StructureService,
    public languagesService: LanguagesService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {}

  /**
   * Focuses out field and update Structure.
   * @param attribute - Attribute of the Structure.
   * @param event - Any Event.
   */
  onFocusOut(attribute: string, event: any): void {
    const text = event.target.innerText;
    this.structure[attribute] = text;
    this.structureService
      .update(this.structure)
      .then((result: Structure) => {
        this.changed.emit(result);
      })
      .catch(err => {
        console.error(err);
      });
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
   * Export the Structure
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
        this.changed.emit(structure);
        this.duplicated.emit(structure);
      });
  }
}
