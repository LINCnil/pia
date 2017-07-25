import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { ModalsComponent } from '../../modals/modals.component';
import { Http } from '@angular/http';
import { Pia } from '../pia.model';
import 'rxjs/add/operator/map'

@Component({
  selector: 'app-entry-content',
  templateUrl: './entry-content.component.html',
  styleUrls: ['./entry-content.component.scss']
})
export class EntryContentComponent implements OnInit {

  @Input() section: {};
  @Input() item: {};
  @Input() pia: Pia;

  modal = new ModalsComponent(this.router);

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private http: Http) {

  }

  ngOnInit() {
  }

  /**
   * Allows an user to ask an evaluation for a section.
   */
  askForEvaluation() {
    this.modal.openModal('ask-for-evaluation');
    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
  }

  /**
   * Allows an user to validate evaluation for a section.
   */
  validateEvaluation() {
    this.modal.openModal('validate-evaluation');
    /* TODO : update PIA status + 'refresh PIA' so that it changes header status icon + navigation status icons */
    /* It should also locks PIA updates for THIS section */
  }

}
