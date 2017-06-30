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
  // see formlist method with ngform
  @ViewChild('f') newCardForm: NgForm;

  constructor(private router: Router) { }

  newPia() {
    this.newCard = new Card(null, null);
    const cardsToSwitch = document.getElementById('cardsSwitch');
    const newCard = document.getElementById('pia-new-card');
    const rocketToHide = document.getElementById('pia-rocket');
    cardsToSwitch.classList.toggle('flipped');
    rocketToHide.style.display = 'none';
    newCard.style.display = 'none';
  }

  importPia() {
    console.log('import de doc');
  }
  onSubmit(form: NgForm) {
    // To navigate from home to PIA
    this.router.navigate(['/entry/5']);
  }


  ngOnInit() {

  }

}
