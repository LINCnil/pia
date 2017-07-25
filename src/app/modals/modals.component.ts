import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit {

  constructor(private router: Router) {
    this.router = router;
  }

  ngOnInit() {
  }

  /**
   * Opens a specific modal through its unique id.
   * @param {string} modal_id unique id of the modal which has to be opened.
   */
  openModal(modal_id: string) {
    if (modal_id === 'pia-declare-measures') {
      const mainContent = document.querySelector('.pia-entryContentBlock');
      mainContent.classList.add('blur-content');
    } else {
      const header = document.querySelector('.pia-headerBlock');
      const container = document.querySelector('.pia-mainContainerBlock');
      header.classList.add('blur');
      container.classList.add('blur');
      /*document.body.classList.add('pia-blurBackground');*/
    }
    document.getElementById(modal_id).classList.add('open');
  }

  /**
   * Closes the current opened modal.
   */
  closeModal() {
    const modal = document.querySelector('[class="pia-modalBlock open"]');
    const mainContent = document.querySelector('.pia-entryContentBlock');
    const header = document.querySelector('.pia-headerBlock');
    const container = document.querySelector('.pia-mainContainerBlock');
    header.classList.remove('blur');
    container.classList.remove('blur');
    modal.classList.remove('open');
  }

  /**
   * Returns to homepage (used on several modals).
   */
  returnToHomepage() {
    this.closeModal();
    this.router.navigate(['home']);
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
    // TODO abandon treatment functionnalities (update the PIA, ...)
  }

  /**
   * Allows users to download a report about the PIA.
   */
  exportPIAReport() {
    // TODO export PIA Report
  }

}
