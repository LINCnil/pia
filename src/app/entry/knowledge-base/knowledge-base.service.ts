import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'

@Injectable()
export class KnowledgeBaseService {
  allKnowledgeBaseData: any[];
  knowledgeBaseData: any[];
  previousKnowledgeBaseData: any[];
  q: string;
  filter: string;
  linkKnowledgeBase: string[] = [];
  hasKnowledgeBaseData = true;

  loadData(http) {
    http.request('/assets/files/pia_knowledge-base.json').map(res => res.json()).subscribe(data => {
      this.knowledgeBaseData = data;
      this.allKnowledgeBaseData = data;
    });
  }

  search(filter?: string, event?: any, linkKnowledgeBase?: any) {
    this.filter = (filter && filter.length > 0) ? filter : '';
    this.linkKnowledgeBase = (linkKnowledgeBase && linkKnowledgeBase.length > 0) ? linkKnowledgeBase : '';
    this.knowledgeBaseData = this.previousKnowledgeBaseData;
    this.specificSearch();
    if (this.knowledgeBaseData && this.filter && this.filter.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter((item) => {
        return (item.filters.startsWith(this.filter));
      });
    }
    if (this.knowledgeBaseData && this.linkKnowledgeBase && this.linkKnowledgeBase.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter((item) => {
        return (this.linkKnowledgeBase.indexOf(item.slug) >= 0);
      });
    }
    this.switchSelectedElement(event);
  }

  loadByItem(item: any, event?: any) {
    if (this.allKnowledgeBaseData && item) {
      this.knowledgeBaseData = this.allKnowledgeBaseData;
      let kbSlugs = [];
      if (item.link_knowledge_base && item.link_knowledge_base.length > 0) {
        kbSlugs = item.link_knowledge_base;
      } else if (item.is_measure) {
        const kbSlugs2 = this.knowledgeBaseData.filter((kbItem) => {
          return kbItem.filters.startsWith('measure.');
        });
        kbSlugs2.forEach(element => {
          kbSlugs.push(element.slug);
        });
      } else if (item.questions) {
        item.questions.forEach(question => {
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
      this.previousKnowledgeBaseData = this.knowledgeBaseData;
      this.specificSearch();
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

  private specificSearch() {
    if (this.q && this.q.length > 0) {
      const re = new RegExp(this.q, 'i');
      this.knowledgeBaseData = this.knowledgeBaseData.filter((item2) => (item2.name.match(re) || item2.description.match(re)));
    }
    this.hasKnowledgeBaseData = this.knowledgeBaseData.length > 0 ? true : false;
  }
}
