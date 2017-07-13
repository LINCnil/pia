import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  /**
   * Opens a specific modal through its unique id.
   * @param {string} modal_id unique id of the modal which has to be opened.
   */
  openModal(modal_id: string) {
    document.body.classList.add('pia-blurBackground');
    document.getElementById(modal_id).classList.add('open');
  }

  /**
   * Closes the current opened modal.
   */
  closeModal() {
    const modal = document.querySelector('[class="pia-modalBlock open"]');
    document.body.classList.remove('pia-blurBackground');
    modal.classList.remove('open');
  }

  abandonTreatment() {
    // TODO
  }

  exportPIAReport() {
    // TODO
  }

}
