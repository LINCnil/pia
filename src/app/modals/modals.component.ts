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

  /**
   * Allows an user to remove a measure ("RISKS" section).
   */
  removeMeasure() {
    const measure_id = localStorage.getItem('measure-id');
    const measureToRemove = document.querySelector(".pia-measureBlock[data-id='" + measure_id + "']");
    localStorage.removeItem('measure-id');
    measureToRemove.remove();
    this.closeModal();
  }

  /**
   *
   */
  abandonTreatment() {
    // TODO
  }

  /**
   *
   */
  exportPIAReport() {
    // TODO
  }

}
