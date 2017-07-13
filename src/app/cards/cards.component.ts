import {Component, OnInit, ViewChild } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Card} from './card.model';
import {Router} from '@angular/router';


@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  newCard: Card;
  cards: any;
  cardForm: FormGroup;

  constructor(private router: Router) { }

  ngOnInit() {
    let card = new Card();
    card.getAll().then((data) => {
      this.cards = data;
    });
    this.cardForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl()
    });
  }

  /**
   * Creates a new PIA card and adds a flip effect to go switch between new PIA and edit PIA events.
   */
  newPIA() {
    this.newCard = new Card();
    const cardsToSwitch = document.getElementById('cardsSwitch');
    cardsToSwitch.classList.toggle('flipped');
    const rocketToHide = document.getElementById('pia-rocket');
    if (rocketToHide) {
      rocketToHide.style.display = 'none';
    }
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
  onSubmit() {
    let card = new Card(
      this.cardForm.value.name,
      this.cardForm.value.author_name,
      this.cardForm.value.evaluator_name,
      this.cardForm.value.validator_name
    );
    const p = card.save();
    p.then((id) => this.router.navigate(['/entry/' + id]));
  }

}
