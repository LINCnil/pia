import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { PaginationService } from 'src/app/entry/entry-content/pagination.service';

@Injectable()
export class ModalsService {
  public revisionDate: any;

  constructor(private router: Router, private paginationService: PaginationService) {}

  /**
   * Opens a specific modal through its unique key (id).
   * @param modalKey - Unique key (id) of the modal which has to be opened.
   */
  openModal(modalKey: string) {
    if (modalKey === 'pia-declare-measures' || modalKey === 'pia-action-plan-no-evaluation' || modalKey === 'pia-dpo-missing-evaluations') {
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
    const e = document.getElementById(modalKey) as HTMLElement;
    e.classList.add('open');
    const gf = e.querySelector('.get-focus') as HTMLButtonElement;
    if (gf) {
      gf.focus();
    }
  }

  /**
   * Closes the current opened modal.
   */
  closeModal(piaId?: number, toAction?: string) {
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
      const gotoSectionItem = this.paginationService.getNextSectionItem(parseInt(goto[0], 10), parseInt(goto[1], 10));

      this.router.navigate(['entry', piaId, 'section', gotoSectionItem[0], 'item', gotoSectionItem[1]]);
    }
  }
}
