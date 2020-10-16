import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Structure } from 'src/app/models/structure.model';
import { LanguagesService } from 'src/app/services/languages.service';
import { ModalsService } from 'src/app/services/modals.service';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-structure-line',
  templateUrl: './structure-line.component.html',
  styleUrls: ['./structure-line.component.scss']
})
export class StructureLineComponent implements OnInit {
  @Input() structure: any;
  @Output() changed = new EventEmitter<Structure>();
  @Output() duplicated = new EventEmitter<Structure>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public structureService: StructureService,
    private modalsService: ModalsService,
    public languagesService: LanguagesService
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
    this.structure.update();
    this.changed.emit(this.structure);
  }

  /**
   * Opens the modal to confirm deletion of a Structure
   * @param id - The Structure id.
   */
  remove(id: string): void {
    localStorage.setItem('structure-id', id);
    this.modalsService.openModal('modal-remove-structure');
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
