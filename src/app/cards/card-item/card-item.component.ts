import { Component, OnInit, Input } from '@angular/core';
import {Card} from '../card.model';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss',
    './card-item_doing.component.scss', './card-item_archived.component.scss'],
})
export class CardItemComponent implements OnInit {
  @Input() card: any;
  editMode: Boolean;

  constructor() {
    this.editMode = false;
  }

  /**
   * Enable or disable edition mode on PIA main fields.
   */
  activateEdition() {
    this.editMode = !this.editMode;
  }

  ngOnInit() {
  }

  delete(id) {
    const el = new Card();
    el.delete(id).then((status) => {
      // TODO supprimer la carte sur l'affichage
    });
  }

}
