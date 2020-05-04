import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { utf8Encode } from '@angular/compiler/src/util';
import { KnowledgeBase } from '../models/knowledgeBase.model';

import { ModalsService } from 'src/app/modals/modals.service';
import { Knowledge } from '../models/knowledge.model';
@Injectable()
export class KnowledgesService {
  public selected: number = null;
  public list: Array<KnowledgeBase> = [];

  constructor(private router: Router, private _modalsService: ModalsService) {}

  public getAll() {
    let kbTemp = new KnowledgeBase();
    return new Promise((resolve, reject) => {
      kbTemp
        .findAll()
        .then((response: any) => {
          let result = [];
          response.forEach(e => {
            result.push(new KnowledgeBase(e.id, e.name, e.author, e.contributors, e.created_at));
          });
          this.list = result;
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public getEntries(baseId) {
    return new Promise((resolve, reject) => {
      let kTemp = new Knowledge();
      kTemp
        .findAllByBaseId(baseId)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public removeKnowledgeBase() {
    let kbTemp = new KnowledgeBase();
    kbTemp
      .delete(this.selected)
      .then(() => {
        // removeFrom this.list
        let index = this.list.findIndex(e => e.id === this.selected);
        if (index !== -1) {
          this.list.splice(index, 1);
          this._modalsService.closeModal();
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * Download the Knowledges exported.
   * @param {number} id - The Structure id.
   */
  export(id: number) {
    const date = new Date().getTime();
    let kbTemp = new KnowledgeBase();
    kbTemp.find(id).then(data => {
      const a = document.getElementById('pia-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_knowledgebase_' + id + '.json');
      const event = new MouseEvent('click', {
        view: window
      });
      a.dispatchEvent(event);
    });
  }

  import(data) {
    return new Promise((resolve, reject) => {
      let newKnowledgeBase = new KnowledgeBase(null, data.name + ' (copy)', data.author, data.contributors, data.knowleges);
      newKnowledgeBase
        .create()
        .then((resp: KnowledgeBase) => {
          newKnowledgeBase.id = resp.id;
          this.list.push(newKnowledgeBase);
          resolve(newKnowledgeBase);
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  }

  duplicate(id: number) {
    const date = new Date().getTime();
    let kbTemp = new KnowledgeBase();
    kbTemp.find(id).then((data: KnowledgeBase) => {
      this.import(data).then((newKnowledgeBase: KnowledgeBase) => {
        // Duplicate entries
        this.getEntries(id).then((knowledges: Knowledge[]) => {
          knowledges.forEach((entry: Knowledge) => {
            let temp = new Knowledge();
            temp.id = entry.id;
            temp.slug = entry.slug;
            temp.filters = entry.filters;
            temp.category = entry.category;
            temp.placeholder = entry.placeholder;
            temp.name = entry.name;
            temp.description = entry.description;
            temp.items = entry.items;
            temp.created_at = new Date(entry.created_at);
            temp.updated_at = new Date(entry.updated_at);
            temp.create(newKnowledgeBase.id).then(e => {
              console.log(e);
            });
          });
        });
      });
    });
  }
}
