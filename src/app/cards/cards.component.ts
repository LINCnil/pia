import {Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Pia} from '../entry/pia.model';
import {Router} from '@angular/router';


@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  newPia: Pia;
  pias: any;
  piaForm: FormGroup;

  constructor(private router: Router) { }

  ngOnInit() {
    let pia = new Pia();
    pia.findAll().then((data) => {
      this.pias = data;
    });
    this.piaForm = new FormGroup({
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
    this.newPia = new Pia();
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
    let pia = new Pia();
    pia.name = this.piaForm.value.name,
    pia.author_name = this.piaForm.value.author_name,
    pia.evaluator_name = this.piaForm.value.evaluator_name,
    pia.validator_name = this.piaForm.value.validator_name
    const p = pia.create();
    p.then((id) => this.router.navigate(['/entry/' + id]));
  }


/*  removeCardItem(event) {
    const test = this.pias.find(pia => pia.id === event);
    console.log(test);
  }*/

}
