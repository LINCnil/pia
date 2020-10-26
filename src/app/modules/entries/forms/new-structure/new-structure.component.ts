import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Structure } from 'src/app/models/structure.model';
import { AppDataService } from 'src/app/services/app-data.service';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-new-structure',
  templateUrl: './new-structure.component.html',
  styleUrls: ['./new-structure.component.scss']
})
export class NewStructureComponent implements OnInit {
  @Output() submited: EventEmitter<any> = new EventEmitter<any>();
  structureForm: FormGroup;

  constructor(
    private appDataService: AppDataService,
    private structureService: StructureService) { }

  ngOnInit(): void {
    this.structureForm = new FormGroup({
      name: new FormControl(),
      sector_name: new FormControl()
    });
  }

  /**
   * Save the newly created structure.
   * Sends to the path associated to this new structure.
   */
  onSubmit(): void {
    const structure = new Structure();
    structure.name = this.structureForm.value.name;
    structure.sector_name = this.structureForm.value.sector_name;
    structure.data = this.appDataService.dataNav;
    this.structureService.create(structure).then(result => this.submited.emit(result));
  }

}
