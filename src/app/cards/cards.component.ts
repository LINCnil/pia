import { Component, OnInit } from '@angular/core';

import { Card } from './card.model';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  public cards: Card[] = [
    new Card('Test title', 'doing'),
    new Card('Test title 2', 'archived')
  ];

  constructor() { }

  ngOnInit() {
  }

}
