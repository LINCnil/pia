import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'

@Injectable()
export class KnowledgeBaseService {
  allKnowledgeBaseData: any[];
  knowledgeBaseData: any[];
  q: string;
  filter: string;
  linkKnowledgeBase: string[] = [];

  loadData(http) {
    http.request('/assets/files/pia_knowledge-base.json').map(res => res.json()).subscribe(data => {
      this.knowledgeBaseData = data;
      this.allKnowledgeBaseData = data;
    });
  }

  search(filter?: string, event?: any, linkKnowledgeBase?: any) {
    this.filter = (filter && filter.length > 0) ? filter : '';
    this.linkKnowledgeBase = (linkKnowledgeBase && linkKnowledgeBase.length > 0) ? linkKnowledgeBase : '';
    this.knowledgeBaseData = this.allKnowledgeBaseData;
    if (this.q && this.q.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter((item) => {
        return (item.name.search(this.q) >= 0 || item.description.search(this.q) >= 0);
      });
    }
    if (this.filter && this.filter.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter((item) => {
        return (item.filters.startsWith(this.filter));
      });
    }
    if (this.linkKnowledgeBase && this.linkKnowledgeBase.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter((item) => {
        return (this.linkKnowledgeBase.indexOf(item.slug) >= 0);
      });
    }
    this.switchSelectedElement(event);
  }

  loadByItem(item: any, event?: any) {
    if (this.allKnowledgeBaseData) {
      this.knowledgeBaseData = this.allKnowledgeBaseData;
      let kbSlugs = [];
      if (item.link_knowledge_base) {
        kbSlugs = item.link_knowledge_base;
      } else if (item.questions) {
        item.questions.forEach(question => {
          console.log(question);
          if (question.link_knowledge_base) {
            question.link_knowledge_base.forEach(kbElement => {
              kbSlugs.push(kbElement);
            });
          }
        });
      }
      if (kbSlugs.length > 0) {
        this.knowledgeBaseData = this.knowledgeBaseData.filter((kbItem) => {
          return kbSlugs.indexOf(kbItem.slug) >= 0;
        });
      } else {
        this.knowledgeBaseData = [];
      }
      this.switchSelectedElement(event);
    }
  }

  switchSelectedElement(event: any) {
    if (event) {
      event.target.parentNode.querySelectorAll('button').forEach(element => {
        element.classList.remove('active');
      });
      event.target.classList.add('active');
    }
  }

  // resizeBlock() {
  //   let totalSize = 0;
  //   const centralElementHeight = <HTMLElement>document.querySelector('.pia-entryContentBlock');
  //   if (centralElementHeight) {
  //     const element = <HTMLElement>document.querySelector('.pia-knowledgeBaseBlock-list');
  //     totalSize = centralElementHeight.offsetHeight - 190;
  //   }
  //   totalSize = totalSize < 700 ? 700 : totalSize;
  //   const kb_block: any = <HTMLElement>document.querySelector('.pia-knowledgeBaseBlock-list');
  //   kb_block.style.height = totalSize + 'px';
  // }
}
