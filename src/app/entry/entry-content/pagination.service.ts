import { Injectable } from '@angular/core';

@Injectable()
export class PaginationService {
  hasPreviousLink: boolean;
  hasNextLink: boolean;
  previousLink: any[] = []; // sectionId, itemId, itemTitle
  nextLink: any[] = []; // sectionId, itemId, itemTitle
  sectionId;
  itemId;

  constructor() { }

  /* TODO : merge this in one single function */

  checkForPreviousLink(data: any) {
    if (this.sectionId === 1 && this.itemId === 1) { // 1.1
      this.hasPreviousLink = false;
    } else { // All others
      this.hasPreviousLink = true;
      this.previousLink = [];
      if (this.sectionId === 1) { // 1.2
        this.previousLink.push(this.sectionId);
        this.previousLink.push(this.itemId - 1);
        this.previousLink.push(data['sections'][this.sectionId - 1]['items'][this.itemId - 2].title);
      } else { // 2.x, 3.x, 4.x
        if (this.itemId !== 1) {  // 2.2, 3.2, 3.3, 3.4, 4.2, ...
          this.previousLink.push(this.sectionId); // Same section id
          this.previousLink.push(this.itemId - 1);  // Prev item id
          this.previousLink.push(data['sections'][this.sectionId - 1]['items'][this.itemId - 2].title); // Prev item title
        } else {  // 2.1, 3.1, 4.1
          this.previousLink.push(this.sectionId - 1); // Prev section id
          const previousSectionLength = data['sections'][this.sectionId - 2]['items'].length;
          const lastPreviousItem = data['sections'][this.sectionId - 2]['items'][previousSectionLength - 1];
          this.previousLink.push(lastPreviousItem.id);  // Prev item id (which is the last item of the previous section)
          this.previousLink.push(lastPreviousItem.title); // Prev item title
        }
      }
    }
  }

  checkForNextLink(data: any) {
    if (this.sectionId === 4 && this.itemId === 3) { // 4.3
      this.hasNextLink = false;
    } else { // All others
      this.hasNextLink = true;
      this.nextLink = [];
      const currentSectionLength = data['sections'][this.sectionId - 1]['items'].length;
      const currentSectionLastItemId = data['sections'][this.sectionId - 1]['items'][currentSectionLength - 1].id;
      if (this.itemId !== currentSectionLastItemId) { // Not the last item from the current section
        this.nextLink.push(this.sectionId); // Same section id
        this.nextLink.push(this.itemId + 1);  // Next item id
        this.nextLink.push(data['sections'][this.sectionId - 1]['items'][this.itemId].title);  // Next item title
      } else {  // last item from the current section
        this.nextLink.push(this.sectionId + 1); // Next section id
        const firstNextItem = data['sections'][this.sectionId]['items'][0];
        this.nextLink.push(firstNextItem.id);  // Next item id (which is the first item of the next section)
        this.nextLink.push(firstNextItem.title); // Next item title
      }
    }
  }

}
