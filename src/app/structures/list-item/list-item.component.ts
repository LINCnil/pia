import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Structure } from 'src/app/structures/structure.model';
import { ModalsService } from 'src/app/modals/modals.service';
import { StructureService } from 'src/app/services/structure.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: `.app-list-item`,
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  providers: [StructureService]
})
export class ListItemComponent implements OnInit {
  @Input() structure: any;
  @Output() structEvent = new EventEmitter<Structure>();

  constructor(private router: Router,
              private route: ActivatedRoute,
              public _structureService: StructureService,
              private _modalsService: ModalsService,
              public _languagesService: LanguagesService,
              private _translateService: TranslateService) { }

  ngOnInit() {
  }

  /**
   * Focuses out field and update Structure.
   * @param {string} attribute - Attribute of the Structure.
   * @param {*} event - Any Event.
   */
  onFocusOut(attribute: string, event: any) {
    const text = event.target.innerText;
    this.structure[attribute] = text;
    this.structure.update();
  }

  /**
   * Opens the modal to confirm deletion of a Structure
   * @param {string} id - The Structure id.
   */
  remove(id: string) {
    localStorage.setItem('structure-id', id);
    this._modalsService.openModal('modal-remove-structure');
  }

  /**
   * Export the Structure
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
