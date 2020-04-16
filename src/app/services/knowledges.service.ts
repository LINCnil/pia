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
        .then((result: KnowledgeBase[]) => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
