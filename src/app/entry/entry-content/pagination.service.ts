import { Injectable } from '@angular/core';
import { SidStatusService } from '../../services/sid-status.service';

@Injectable()
export class PaginationService {
  hasPreviousLink: boolean;
  hasNextLink: boolean;
  previousLink: PaginationItem;
  nextLink: PaginationItem;
  dataNav: any;

  constructor(
    private _sidStatusService: SidStatusService
  ) {
    this.initLinks();
  }

  /**
   * Set the pagination.
   * @param {number} sectionId - The section id.
   * @param {number} itemId - The item id.
   * @memberof PaginationService
   */
  setPagination(sectionId: number, itemId: number) {
    this.initLinks();

    this.getNextLink(sectionId, itemId);
    this.getPreviousLink(sectionId, itemId);
  }

  private getNextLink(sectionId: number, itemId: number) {
    let nextSectionId = sectionId;
    let nextItemId = itemId;

    this.hasNextLink = !(nextSectionId === 4 && itemId === this.getSection(4)['items'].length);

    if (this.hasNextLink) {
      if (nextItemId < this.getSection(nextSectionId).items.length) {
        nextItemId++;
      } else {
        nextItemId = 1;
        nextSectionId++;
      }
    }

    this.nextLink.section = nextSectionId;
    this.nextLink.item = nextItemId;
    this.nextLink.title = this.getItemTitle(nextSectionId, nextItemId);
  }

  private getPreviousLink(sectionId: number, itemId: number) {
    let previousSectionId = sectionId;
    let previousItemId = itemId;

    this.hasPreviousLink = !(previousSectionId === 3 && itemId === 1);

    if (this.hasPreviousLink) {
      if (previousItemId === 1) {
        previousSectionId--;
        previousItemId = this.getSection(previousSectionId).items.length
      } else {
        previousItemId--;
      }
    }

    this.previousLink.section = previousSectionId;
    this.previousLink.item = previousItemId;
    this.previousLink.title = this.getItemTitle(previousSectionId, previousItemId);
  }

  private getItemTitle(sectionId: number, itemId: number): string {
    const item = this.getSection(sectionId).items.filter(itm => itm.id === itemId)[0];
    return item ? item.title : '';
  }

  private getSection(sectionId: number) {
    return this.dataNav.sections.filter(section => section.id === sectionId)[0];
  }

  private initLinks(): void {
    this.previousLink = {
      section: 3,
      item: 1,
      title: ''
    };
    this.nextLink = {
      section: 3,
      item: 2,
      title: ''
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
      if (this.nextLink.section && this.nextLink.item && this.nextLink.section !== 4 && this.nextLink.item !== 3) {
        goto_section = this.nextLink.section;
        goto_item = this.nextLink.item;
      } else {
        goto_section = 3;
        goto_item = 1;
      }
    }

    return [goto_section, goto_item];
  }
}

interface PaginationItem {
  section: number
  item: number
  title: string
}
