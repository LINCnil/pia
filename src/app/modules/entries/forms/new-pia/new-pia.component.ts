import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Structure } from 'src/app/models/structure.model';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-new-pia',
  templateUrl: './new-pia.component.html',
  styleUrls: ['./new-pia.component.scss']
})
export class NewPiaComponent implements OnInit {
  @Output() submited: EventEmitter<any> = new EventEmitter<any>();
  piaForm: FormGroup;
  structureList: Array<Structure> = [];

  constructor(
    private piaService: PiaService,
    public structureService: StructureService) {
      this.structureService.getAll()
        .then((response: Array<Structure>) => {
          this.structureList = response;
        })
        .catch((err) => {
          console.error(err);
        });
    }

  ngOnInit(): void {
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl(),
      category: new FormControl(),
      structure: new FormControl([])
    });
  }

  /**
   * Save the newly created PIA.
   */
  onSubmit(): void {
    this.piaService.saveNewPia(this.piaForm).then((id: number) => {
      this.submited.emit(id);
    });
  }

}
