import { Injectable } from '@angular/core';

import { SidStatusService } from 'app/services/sid-status.service';

@Injectable()
export class PaginationService {
  hasPreviousLink: boolean;
  hasNextLink: boolean;
  previousLink: any[] = []; // sectionId, itemId, itemTitle
  nextLink: any[] = []; // sectionId, itemId, itemTitle
  dataNav: any;

  constructor(private _sidStatusService: SidStatusService) { }

  /**
   * Set the pagination.
   * @param {number} sectionId - The section id.
   * @param {number} itemId - The item id.
   * @memberof PaginationService
   */
  setPagination(sectionId: number, itemId: number) {
    this.previousLink = [];
    this.nextLink = [];
    this.hasPreviousLink = !(sectionId === 1 && itemId === 1) && !(sectionId === 4 && itemId === 4) && !(sectionId === 4 && itemId === 5);
    this.hasNextLink = !(sectionId === 4 && (itemId === 3 || itemId === 4 || itemId === 5));

    if (this.hasPreviousLink) {
      if (sectionId === 1) { // 1.2
        this.previousLink.push(sectionId);
        this.previousLink.push(itemId - 1);
        this.previousLink.push(this.dataNav['sections'][sectionId - 1]['items'][itemId - 2].title);
      } else { // 2.x, 3.x, 4.x
        if (itemId !== 1) {  // 2.2, 3.2, 3.3, 3.4, 4.2, ...
          this.previousLink.push(sectionId); // Same section id
          this.previousLink.push(itemId - 1);  // Prev item id
          this.previousLink.push(this.dataNav['sections'][sectionId - 1]['items'][itemId - 2].title); // Prev item title
        } else {  // 2.1, 3.1, 4.1
          this.previousLink.push(sectionId - 1); // Prev section id
          const previousSectionLength = this.dataNav['sections'][sectionId - 2]['items'].length;
          const lastPreviousItem = this.dataNav['sections'][sectionId - 2]['items'][previousSectionLength - 1];
          this.previousLink.push(lastPreviousItem.id);  // Prev item id (which is the last item of the previous section)
          this.previousLink.push(lastPreviousItem.title); // Prev item title
        }
      }
    }
    if (this.hasNextLink) {
      const currentSectionLength = this.dataNav['sections'][sectionId - 1]['items'].length;
      const currentSectionLastItemId = this.dataNav['sections'][sectionId - 1]['items'][currentSectionLength - 1].id;
      if (itemId !== currentSectionLastItemId) { // Not the last item from the current section
        this.nextLink.push(sectionId); // Same section id
        this.nextLink.push(itemId + 1);  // Next item id
        this.nextLink.push(this.dataNav['sections'][sectionId - 1]['items'][itemId].title);  // Next item title
      } else {  // last item from the current section
        this.nextLink.push(sectionId + 1); // Next section id
        const firstNextItem = this.dataNav['sections'][sectionId]['items'][0];
        this.nextLink.push(firstNextItem.id);  // Next item id (which is the first item of the next section)
        this.nextLink.push(firstNextItem.title); // Next item title
      }
    }
  }

  /**
   * Get next item to go.
   * @private
   * @param {number} status_start - From status.
   * @param {number} status_end - To status.
   * @memberof EntryContentComponent
   */
  getNextSectionItem(status_start: number, status_end: number) {
    let goto_section = null;
    let goto_item = null;

    const itemStatus = Object.keys(this._sidStatusService.itemStatus).sort().reduce(
      (r, k) => (r[k] = this._sidStatusService.itemStatus[k], r), {}
    );

    for (const el in itemStatus) {
      if (this._sidStatusService.itemStatus.hasOwnProperty(el) &&
          this._sidStatusService.itemStatus[el] >= status_start &&
          this._sidStatusService.itemStatus[el] < status_end &&
          el !== '4.3') {
        const reference_to = el.split('.');
        goto_section = reference_to[0];
        goto_item = reference_to[1];
        break;
      }
    }

    if (!goto_section || !goto_item) {
      if (this.nextLink[0] && this.nextLink[1] && this.nextLink[0] !== 4 && this.nextLink[1] !== 3) {
        goto_section = this.nextLink[0];
        goto_item = this.nextLink[1];
      } else {
        goto_section = 1;
        goto_item = 1;
      }
    }

    return [goto_section, goto_item];
  }
}
