import { Component, OnInit } from '@angular/core';
import { CardsComponent } from '../cards/cards.component';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent extends CardsComponent implements OnInit {

  ngOnInit() {
  }

}
