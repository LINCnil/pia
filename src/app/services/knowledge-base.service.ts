import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import piakb from 'src/assets/files/pia_knowledge-base.json';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { Knowledge } from '../models/knowledge.model';
import { ApplicationDb } from '../application.db';
import { KnowledgeBase } from '../models/knowledgeBase.model';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable()
export class KnowledgeBaseService extends ApplicationDb {
  allKnowledgeBaseData: any[];
  knowledgeBaseData: any[];
  previousKnowledgeBaseData: any[];
  q: string;
  filter: string;
  linkKnowledgeBase: string[] = [];
  placeholder: string;
  toHide = [];

  constructor(
    private router: Router,
    public translateService: TranslateService,
    private knowledgesService: KnowledgesService,
    protected apiService: ApiService
  ) {
    super(201911191636, 'knowledgeBase');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  public getAll(): Promise<KnowledgeBase[]> {
    return new Promise((resolve, reject) => {
      this.findAll()
        .then((response: KnowledgeBase[]) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get a KnowledgeBase.
   * @param id - The KnowledgeBase id.
   * @returns - New Promise
   */
  get(id: number): Promise<KnowledgeBase> {
    return new Promise((resolve, reject) => {
      this.find(id)
        .then((entry: any) => {
          resolve(entry);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Create a new Structure.
   * @returns - New Promise
   */
  create(base: KnowledgeBase): Promise<KnowledgeBase> {
    return new Promise((resolve, reject) => {
      super
        .create(base, 'knowledge_base')
        .then((res: KnowledgeBase) => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  update(base: KnowledgeBase): Promise<KnowledgeBase> {
    return new Promise((resolve, reject) => {
      super
        .update(base.id, base, 'knowledge_base')
        .then((res: KnowledgeBase) => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Download the Knowledges exported.
   * @param {number} id - The Structure id.
   */
  export(id: number): void {
    const date = new Date().getTime();
    this.find(id).then((data: KnowledgeBase) => {
      this.knowledgesService.getEntries(id).then(knowledges => {
        data.knowledges = knowledges;
        const a = document.getElementById('pia-exportBlock');
        const url =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(data));
        a.setAttribute('href', url);
        a.setAttribute(
          'download',
          date + '_export_knowledgebase_' + id + '.json'
        );
        const event = new MouseEvent('click', {
          view: window
        });
        a.dispatchEvent(event);
      });
    });
  }

  import(file): Promise<KnowledgeBase> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (event2: any) => {
        const data = JSON.parse(event2.target.result);

        const newKnowledgeBase = new KnowledgeBase(
          null,
          data.name + ' (IMPORT)',
          data.author,
          data.contributors,
          new Date()
        );
        this.create(newKnowledgeBase)
          .then(async (resp: KnowledgeBase) => {
            newKnowledgeBase.id = resp.id;
            for (const knowledge of data.knowledges) {
              delete knowledge.id;
              await this.knowledgesService
                .add(newKnowledgeBase.id, knowledge)
                .then()
                .catch();
            }
            resolve(newKnowledgeBase);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      };
    });
  }

  /**
   * Duplicate base and it's knowleges
   * @param id base's id
   */
  duplicate(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const date = new Date().getTime();
      this.find(id).then((data: KnowledgeBase) => {
        this.create(
          new KnowledgeBase(
            null,
            data.name + ' (copy)',
            data.author,
            data.contributors
          )
        )
          .then((newKnowledgeBase: KnowledgeBase) => {
            // Duplicate entries
            this.knowledgesService
              .getEntries(id)
              .then((knowledges: Knowledge[]) => {
                knowledges.forEach((entry: Knowledge) => {
                  const temp = new Knowledge();
                  temp.slug = entry.slug;
                  temp.filters = entry.filters;
                  temp.category = entry.category;
                  temp.placeholder = entry.placeholder;
                  temp.name = entry.name;
                  temp.description = entry.description;
                  temp.items = entry.items;
                  temp.created_at = new Date(entry.created_at);
                  temp.updated_at = new Date(entry.updated_at);
                  this.knowledgesService
                    .add(newKnowledgeBase.id, temp)
                    .then(e => {
                      console.log(e);
                      resolve();
                    })
                    .catch(err => {
                      reject(err);
                    });
                });
              });
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  /**
   * Load the knowledge base
   * @param {any} http
   */
  loadData(http: HttpClient): void {
    this.knowledgeBaseData = piakb;
    this.allKnowledgeBaseData = piakb;
    // Parse IndexDb's Knowledge here
  }

  /**
   * Replace current Knowledge base by CUSTOM ENTRIES
   * @param params Knowledge Base Id
   */
  switch(params): Promise<any> {
    return new Promise((resolve, reject) => {
      if (parseInt(params) !== 0) {
        this.knowledgesService
          .getEntries(parseInt(params))
          .then((result: Knowledge[]) => {
            const newBase = [];
            // parsing
            result.forEach(e => {
              if (e.items) {
                e.items.forEach(item => {
                  // entries
                  newBase.push({
                    slug: 'PIA_CUSTOM_' + item,
                    category: e.category,
                    name: e.name,
                    description: e.description,
                    filters: e.filters && e.filters !== '' ? e.filters : ''
                  });
                });
              }
            });
            this.knowledgeBaseData = newBase;
            this.allKnowledgeBaseData = newBase;
            this.previousKnowledgeBaseData = newBase;
            resolve(this.knowledgeBaseData);
          })
          .catch(err => {
            reject(err);
          });
      } else {
        // default knowledge base
        this.knowledgeBaseData = piakb;
        this.allKnowledgeBaseData = piakb;
        this.previousKnowledgeBaseData = piakb;
        resolve(this.knowledgeBaseData);
      }
    });
  }

  /**
   * Global search method.
   * @param filter - Text to search.
   * @param event - Any Event.
   * @param linkKnowledgeBase - Link knowledge base.
   */
  search(filter?: string, event?: any, linkKnowledgeBase?: any): void {
    this.filter = filter && filter.length > 0 ? filter : '';
    this.linkKnowledgeBase =
      linkKnowledgeBase && linkKnowledgeBase.length > 0
        ? linkKnowledgeBase
        : '';
    this.knowledgeBaseData = this.previousKnowledgeBaseData;
    this.specificSearch();
    if (this.knowledgeBaseData && this.filter && this.filter.length > 0) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter(item => {
        return item.filters.startsWith(this.filter);
      });
    }
    if (
      this.knowledgeBaseData &&
      this.linkKnowledgeBase &&
      this.linkKnowledgeBase.length > 0
    ) {
      this.knowledgeBaseData = this.knowledgeBaseData.filter(item => {
        return this.linkKnowledgeBase.indexOf(item.slug) >= 0;
      });
    }
    this.switchSelectedElement(event);
  }

  /**
   * Load knowledge base by item.
   * @param item - An item of a section.
   * @param event - List of Events.
   */
  loadByItem(item: any, event?: any): void {
    if (this.allKnowledgeBaseData && item) {
      this.knowledgeBaseData = this.allKnowledgeBaseData;
      let kbSlugs = [];
      if (item.link_knowledge_base && item.link_knowledge_base.length > 0) {
        kbSlugs = item.link_knowledge_base;
      } else if (item.is_measure) {
        let kbSlugs2 = [];
        kbSlugs2 = this.knowledgeBaseData.filter(kbItem => {
          // Custom knowledge base measure entries
          if (kbItem.slug && kbItem.slug.startsWith('PIA_CUSTOM_')) {
            return kbItem.slug.startsWith('PIA_CUSTOM_31');
            // Standard knowledge base measure entries (default CNIL's knowledge base)
          } else if (kbItem.filters) {
            return kbItem.filters.startsWith('measure.');
          }
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
   * @param event - Any Event.
   */
  switchSelectedElement(event: any): void {
    if (event) {
      event.target.parentNode.querySelectorAll('button').forEach(element => {
        element.classList.remove('active');
      });
      event.target.classList.add('active');
    }
  }

  /**
   * Remove an item if present.
   * @param newItemTitle - New title to compare.
   * @param previousItemTitle  - Previous title to compare.
   */
  removeItemIfPresent(newItemTitle: string, previousItemTitle: string): void {
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
  private specificSearch(): void {
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
  }
}
