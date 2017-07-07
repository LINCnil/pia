import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss',
    './card-item_doing.component.scss', './card-item_archived.component.scss'],
})
export class CardItemComponent implements OnInit {
  @Input() card: { name: string, status: string, editMode: boolean, flip: boolean };


  constructor() {

  }
  onEdit() {
    this.card.editMode = !this.card.editMode;
  }
  ngOnInit() {

  }

}
