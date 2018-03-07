import { Injectable } from '@angular/core';

@Injectable()
export class PaginationService {
  hasPreviousLink: boolean;
  hasNextLink: boolean;
  previousLink: any[] = []; // sectionId, itemId, itemTitle
  nextLink: any[] = []; // sectionId, itemId, itemTitle
  dataNav: any;

  constructor() { }

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

}
