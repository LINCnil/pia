import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Card } from '../card.model';


@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss',
    './card-item_doing.component.scss', './card-item_archived.component.scss'],
  animations: [
    trigger('frontState', [
      state('normal', style({
        transform: 'translate(0)'
      })),
      state('flip', style({
        transform: 'translate(0)'
      })),
      transition('normal => flip', animate('400ms', keyframes([
        style({transform: 'rotate3d(0,1,0,0deg)'}),
        style({transform: 'rotate3d(0,1,0,180deg)'})
      ]))),
    ]),
    trigger('backState', [
      state('normal', style({
        transform: 'translate(0)'
      })),
      state('flip', style({
        transform: 'translate(0)'
      })),
      transition('normal => flip', animate('400ms', keyframes([
        style({transform: 'rotate3d(0,1,0,90deg)'}),
        style({transform: 'rotate3d(0,1,0,180deg)'})
      ]))),
    ])

  ]
})
export class CardItemComponent implements OnInit {
  @Input() card: { name: string, status: string, editMode: boolean, flip: boolean };
  frontState = 'normal';
  backState = 'normal';

  constructor() {

  }
  onEdit() {
    this.card.editMode = !this.card.editMode;
  }

  onFlip() {
    this.frontState = (this.frontState === 'normal' ? 'flip' : 'normal');
    this.backState = (this.backState === 'normal' ? 'flip' : 'normal');

  }

  ngOnInit() {

  }

}
