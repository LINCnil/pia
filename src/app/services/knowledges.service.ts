import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { utf8Encode } from '@angular/compiler/src/util';
import { KnowledgeBase } from '../models/knowledgeBase.model';

import { ModalsService } from 'src/app/modals/modals.service';
@Injectable()
export class KnowledgesService {
  public selected = null;
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
            result.push(new KnowledgeBase(e.id, e.name, e.author, e.contributors, e.knowleges, e.created_at));
          });
          this.list = result;
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  public removeKnowledgeBase() {
    let kbTemp = new KnowledgeBase();
    kbTemp
      .delete(this.selected)
      .then(() => {
        console.log('cool !');
        // removeFrom this.list
        let index = this.list.findIndex(e => (e.id = this.selected));
        if (index !== -1) {
          this.list.splice(index, 1);
          this._modalsService.closeModal();
        }
      })
      .catch(() => {
        console.log('Erreur !');
      });
  }
}
