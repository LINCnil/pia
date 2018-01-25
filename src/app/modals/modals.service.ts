import {ElementRef, Injectable, Output} from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class ModalsService {


  constructor(private router: Router) {}

  /**
   * Opens a specific modal through its unique id.
   * @param {string} modal_id unique id of the modal which has to be opened.
   */
  openModal(modal_id: string) {
    if (modal_id === 'pia-declare-measures') {
      const mainContent = document.querySelector('.pia-entryContentBlock');
      if (mainContent) {
        mainContent.classList.add('blur-content');
      }
    } else {
      const header = document.querySelector('.pia-headerBlock');
      const container = document.querySelector('.pia-mainContainerBlock');

      header.classList.add('blur');
      container.classList.add('blur');
    }
    const e = <HTMLElement>document.getElementById(modal_id);
    e.classList.add('open');
    const gf = (<HTMLButtonElement>e.querySelector('.get-focus'));
    if (gf) {
      gf.focus();
    }
  }

  /**
   * Closes the current opened modal.
   */
  closeModal() {
    const modal = document.querySelector('.pia-modalBlock.open');
    const mainContent = document.querySelector('.pia-entryContentBlock');
    if (mainContent) {
      mainContent.classList.remove('blur-content');
    }
    const header = document.querySelector('.pia-headerBlock');
    const container = document.querySelector('.pia-mainContainerBlock');
    header.classList.remove('blur');
    container.classList.remove('blur');
    modal.classList.remove('open');
  }
}
