import { Component, OnInit, ComponentRef, Input, Output, EventEmitter } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Pia} from '../../entry/pia.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss',
    './card-item_doing.component.scss', './card-item_archived.component.scss'],
})
export class CardItemComponent implements OnInit {
  @Input() pia: any;
  @Output() delete: EventEmitter<number> = new EventEmitter<number>();
  editMode: Boolean;
  piaForm: FormGroup;

  constructor(private router: Router) {
    this.editMode = false;
  }

  ngOnInit() {
    this.piaForm = new FormGroup({
      id: new FormControl(this.pia.id),
      name: new FormControl({ value: this.pia.name, disabled: true }),
      author_name: new FormControl({ value: this.pia.author_name, disabled: true }),
      evaluator_name: new FormControl({ value: this.pia.evaluator_name, disabled: true }),
      validator_name: new FormControl({ value: this.pia.validator_name, disabled: true })
    });
  }

  /**
   * Enables or disables edition mode on PIA main fields.
   */
  activateEdition() {
    this.editMode = !this.editMode;
    if(this.editMode) {
      this.piaForm.enable();
    } else {
      this.piaForm.disable();
    }
  }

  /**
   * TODO : explain this function
   */
  onSubmit() {
    let pia = new Pia();
    pia.id = this.piaForm.value.id;
    pia.find(pia.id).then((entry: any) => {
      pia.name = this.piaForm.value.name
      pia.author_name = this.piaForm.value.author_name
      pia.evaluator_name = this.piaForm.value.evaluator_name
      pia.validator_name = this.piaForm.value.validator_name
      pia.update();
      this.activateEdition();
    });
  }

  /**
   * Deletes a PIA with a given id.
   * @param id {number} id of the PIA to be deleted.
   */
  deletePIA(id: number) {
    if (confirm('Merci de confirmer la suppression de ce PIA')) {
      const el = new Pia();
      this.delete.emit(id);
      el.delete(id);
    }
  }

}
