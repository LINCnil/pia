import { Component, OnInit  } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Pia } from '../entry/pia.model';

import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  providers: [PiaService]
})
export class CardsComponent implements OnInit {

  newPia: Pia;
  piaForm: FormGroup;
  filter: string;

  constructor(private router: Router,
              private _piaService: PiaService) { }

  ngOnInit() {
    const pia = new Pia();
    pia.findAll().then((data: any[]) => {
      this._piaService.pias = data;
      this.filter = localStorage.getItem('sort');
      if (this.filter && this.filter.length > 0) {
        this.sortBy(this.filter);
      } else {
        this.sortBy('udpated_at');
      }
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
    // TODO import PIA
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   */
  onSubmit() {
    const pia = new Pia();
    pia.name = this.piaForm.value.name;
    pia.author_name = this.piaForm.value.author_name;
    pia.evaluator_name = this.piaForm.value.evaluator_name;
    pia.validator_name = this.piaForm.value.validator_name;
    const p = pia.create();
    p.then((id) => this.router.navigate(['entry', id, 'section', 1, 'item', 1]));
  }

  /**
   * Asort items created on PIA
   */
  sortBy(sort: string) {
    this.filter = sort;
    localStorage.setItem('sort', sort);
    this._piaService.pias = this._piaService.pias.sort((a, b) => {
      return (a[sort] > b[sort]) ? 1 : 0 ;
    });
    if (sort === 'updated_at') {
      this._piaService.pias.reverse();
    }
  }
}
