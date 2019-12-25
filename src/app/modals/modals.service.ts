import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ApplicationDb } from '../application.db';

import { Revision } from '../models/revision.model';

import { PaginationService } from 'src/app/entry/entry-content/pagination.service';

@Injectable()
export class ModalsService {
  private revisionDb: ApplicationDb;
  public revisionDate: any;

  constructor(
    private _router: Router,
    private _paginationService: PaginationService
  ) {}

  /**
   * Opens a specific modal through its unique id.
   * @param {string} modal_id - Unique id of the modal which has to be opened.
   */
  openModal(modal_id: string) {
    if (
      modal_id === 'pia-declare-measures' ||
      modal_id === 'pia-action-plan-no-evaluation' ||
      modal_id === 'pia-dpo-missing-evaluations'
    ) {
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
    const gf = <HTMLButtonElement>e.querySelector('.get-focus');
    if (gf) {
      gf.focus();
    }

    /* Opening special modal with revision date */
    const id = parseInt(localStorage.getItem('revision-date-id'), 10);
    if (id) {
      this.revisionDb = new ApplicationDb(201911191636, 'revision');
      this.revisionDb.find(id).then(async (response: Revision) => {
        this.revisionDate = response.created_at;
      });
    }
  }

  /**
   * Closes the current opened modal.
   */
  closeModal(pia_id?: number, toAction?: string) {
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
    if (toAction && toAction.length > 0) {
      const goto = toAction.split('-');
      const goto_section_item = this._paginationService.getNextSectionItem(
        parseInt(goto[0], 10),
        parseInt(goto[1], 10)
      );

      this._router.navigate([
        'entry',
        pia_id,
        'section',
        goto_section_item[0],
        'item',
        goto_section_item[1]
      ]);
    }
  }
}
