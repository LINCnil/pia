import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { StructureService } from 'src/app/services/structure.service';

@Component({
  selector: 'app-new-pia',
  templateUrl: './new-pia.component.html',
  styleUrls: ['./new-pia.component.scss']
})
export class NewPiaComponent implements OnInit {
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  piaForm: FormGroup;

  constructor(
    public structureService: StructureService) { }

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

  onSubmit(): void {
    this.submit.emit(this.piaForm);
  }

}
