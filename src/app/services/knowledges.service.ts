import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { utf8Encode } from '@angular/compiler/src/util';
import { KnowledgeBase } from '../models/knowledgeBase.model';

@Injectable()
export class KnowledgesService {
  constructor(private router: Router) {}

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
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
