import { Component, OnInit, Input } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Card} from '../card.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss',
    './card-item_doing.component.scss', './card-item_archived.component.scss'],
})
export class CardItemComponent implements OnInit {
  @Input() card: any;
  editMode: Boolean;
  cardForm: FormGroup;

  constructor(private router: Router) {
    this.editMode = false;
  }

  /**
   * Enable or disable edition mode on PIA main fields.
   */
  activateEdition() {
    this.editMode = !this.editMode;
    if(this.editMode) {
      this.cardForm.enable();
    } else {
      this.cardForm.disable();
    }
  }

  ngOnInit() {
    this.cardForm = new FormGroup({
      id: new FormControl(this.card.id),
      name: new FormControl({ value: this.card.name, disabled: true }),
      author_name: new FormControl({ value: this.card.author_name, disabled: true }),
      evaluator_name: new FormControl({ value: this.card.evaluator_name, disabled: true }),
      validator_name: new FormControl({ value: this.card.validator_name, disabled: true })
    });
  }

  onSubmit() {
    let card = new Card();
    card.id = this.cardForm.value.id;
    card.find(card.id).then((entry: any) => {
      card.name = this.cardForm.value.name
      card.author_name = this.cardForm.value.author_name
      card.evaluator_name = this.cardForm.value.evaluator_name
      card.validator_name = this.cardForm.value.validator_name
      card.update();
      this.activateEdition();
    });
  }

  delete(id) {
    const el = new Card();
    el.delete(id).then((status) => {
      // TODO supprimer la carte sur l'affichage
    });
  }

}
