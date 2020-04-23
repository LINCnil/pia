import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import piakb from 'src/assets/files/pia_knowledge-base.json';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { Knowledge } from 'src/app/models/knowledge.model';

@Injectable()
export class KnowledgeBaseService {
  allKnowledgeBaseData: any[];
  knowledgeBaseData: any[];
  previousKnowledgeBaseData: any[];
  q: string;
  filter: string;
  linkKnowledgeBase: string[] = [];
  hasKnowledgeBaseData = true;
  placeholder: string;
  translateService: any;
  toHide = [];

  constructor(private _knowledgesService: KnowledgesService) {}

  /**
   * Load the knowledge base
   * @param {any} http
   */
  loadData(http: HttpClient) {
    this.knowledgeBaseData = piakb;
    this.allKnowledgeBaseData = piakb;
    // Parse IndexDb's Knowledge here
  }

  /**
   * Replace current Knowledge base by CUSTOM ENTRIES
   * @param params Knowledge Base Id
   */
  switch(params) {
    return new Promise((resolve, reject) => {
      console.log('switch', params);
      if (parseInt(params) !== 0) {
        this._knowledgesService
          .getEntries(parseInt(params))
          .then((result: Knowledge[]) => {
            let newBase = [];
            // TODO: parsing
            result.forEach(e => {
              if (e.items) {
                e.items.forEach(item => {
                  // entries
                  newBase.push({
                    slug: 'PIA_CUSTOM_' + item,
                    category: e.category,
                    name: e.name,
                    description: e.description,
                    filters: ''
                  });
                });
              }
            });
            this.knowledgeBaseData = newBase;
            this.allKnowledgeBaseData = newBase;
            this.previousKnowledgeBaseData = newBase;
            console.log(this.knowledgeBaseData);
            resolve(true);
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      } else {
        // TODO: default knowledge base
        this.knowledgeBaseData = piakb;
        this.allKnowledgeBaseData = piakb;
        this.previousKnowledgeBaseData = piakb;
        resolve(true);
      }
    });
  }

  /**
   * Global search method.
   * @param {string} [filter] - Text to search.
   * @param {*} [event] - Any Event.
   * @param {*} [linkKnowledgeBase] - Link knowledge base.
   */
  search(filter?: string, event?: any, linkKnowledgeBase?: any) {
    this.filter = filter && filter.length > 0 ? filter : '';
    this.linkKnowledgeBase = linkKnowledgeBase && linkKnowledgeBase.length > 0 ? linkKnowledgeBase : '';
    this.knowledgeBaseData = this.previousKnowledgeBaseData;
    this.specificSearch();
    if (this.knowledgeBaseData && this.filter && this.filter.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter(item => {
        return item.filters.startsWith(this.filter);
      });
    }
    if (this.knowledgeBaseData && this.linkKnowledgeBase && this.linkKnowledgeBase.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter(item => {
        return this.linkKnowledgeBase.indexOf(item.slug) >= 0;
      });
    }
    this.switchSelectedElement(event);
  }

  /**
   * Load knowledge base by item.
   * @param {*} item - An item of a section.
   * @param {*} [event] - List of Events.
   */
  loadByItem(item: any, event?: any) {
    console.log('load  by item');
    if (this.allKnowledgeBaseData && item) {
      this.knowledgeBaseData = this.allKnowledgeBaseData;
      let kbSlugs = [];
      if (item.link_knowledge_base && item.link_knowledge_base.length > 0) {
        kbSlugs = item.link_knowledge_base;
      } else if (item.is_measure) {
        const kbSlugs2 = this.knowledgeBaseData.filter(kbItem => {
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
        this.knowledgeBaseData = this.knowledgeBaseData.filter(kbItem => {
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

  /**
   * Switch between element.
   * @param {*} event - Any Event.
   */
  switchSelectedElement(event: any) {
    if (event) {
      event.target.parentNode.querySelectorAll('button').forEach(element => {
        element.classList.remove('active');
      });
      event.target.classList.add('active');
    }
  }

  /**
   * Remove an item if present.
   * @param {string} newItemTitle - New title to compare.
   * @param {string} previousItemTitle  - Previous title to compare.
   */
  removeItemIfPresent(newItemTitle: string, previousItemTitle: string) {
    if (!this.toHide.includes(newItemTitle)) {
      this.toHide.push(newItemTitle);
      if (this.toHide.includes(previousItemTitle)) {
        const index = this.toHide.indexOf(previousItemTitle);
        this.toHide.splice(index, 1);
      }
    }
  }

  /**
   * New specific search in the knowledge base.
   * @private
   */
  private specificSearch() {
    if (this.q && this.q.length > 0) {
      const re = new RegExp(this.q, 'i');
      this.knowledgeBaseData = this.knowledgeBaseData.filter(
        item2 =>
          this.translateService.instant(item2.name).match(re) ||
          this.translateService.instant(item2.description).match(re) ||
          item2.name.match(re) ||
          item2.description.match(re)
      );
    }
    this.hasKnowledgeBaseData = this.knowledgeBaseData.length > 0 ? true : false;
  }
}
