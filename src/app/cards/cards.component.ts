import {Component, OnInit, ViewChild } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Card} from './card.model';
import {Router} from '@angular/router';


@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  newCard: Card;
  cards: Card[] = [];
  /*cards: Card[] = [new Card(4, 2, 'test', 'test2', 'test3', 'test4')];*/
  // see formlist method with ngform
  @ViewChild('f') newCardForm: NgForm;

  constructor(private router: Router) { }

  /**
   * Creates a new PIA card and adds a flip effect to go switch between new PIA and edit PIA events.
   */
  newPIA() {
    this.newCard = new Card(null, null);
    const cardsToSwitch = document.getElementById('cardsSwitch');
    const newCard = document.getElementById('pia-new-card');
    const rocketToHide = document.getElementById('pia-rocket');
    cardsToSwitch.classList.toggle('flipped');
    rocketToHide.style.display = 'none';
  }

  /**
   * Allows users to import a PIA.
   */
  importPIA() {
    // TODO
  }

  /**
   * Save the newly created PIA.
   * Sends on the link associated to this new PIA.
   */
  onSubmit(form: NgForm) {
    // TODO : save the new PIA

    // To navigate from home to PIA
    this.router.navigate(['/entry/5']);
  }


  ngOnInit() {

  }

}
