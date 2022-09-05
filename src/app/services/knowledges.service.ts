import { Injectable } from '@angular/core';

import { Knowledge } from '../models/knowledge.model';
import { ApplicationDb } from '../application.db';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable()
export class KnowledgesService extends ApplicationDb {
  constructor(private router: Router, protected apiService: ApiService) {
    super(201911191636, 'knowledge');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  public getEntries(baseId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findAllByBaseId(baseId)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Create a new Knowledge ENTRY.
   * @returns - New Promise
   */
  add(baseId: number, knowledge: Knowledge): Promise<Knowledge> {
    this.knowledge_base_id = baseId;
    knowledge.knowledge_base_id = baseId;

    return new Promise((resolve, reject) => {
      super
        .create(knowledge, 'knowledge')
        .then((res: Knowledge) => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  update(knowledge: Knowledge): Promise<Knowledge> {
    return new Promise((resolve, reject) => {
      super
        .update(knowledge.id, knowledge, 'knowledge')
        .then((result: Knowledge) => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  duplicate(baseId: number, id: number): Promise<Knowledge> {
    return new Promise((resolve, reject) => {
      this.find(id).then((entry: Knowledge) => {
        const temp = new Knowledge();
        temp.slug = entry.slug;
        temp.filters = entry.filters;
        temp.category = entry.category;
        temp.placeholder = entry.placeholder;
        temp.name = entry.name;
        temp.description = entry.description;
        temp.items = entry.items;
        temp.created_at = entry.created_at;
        temp.updated_at = entry.updated_at;
        this.add(baseId, temp)
          .then((result: Knowledge) => {
            resolve(result);
          })
          .catch(err => {
            reject(err);
            console.error(err);
          });
      });
    });
  }

  /**
   * List all Knowledge by base id
   * @param baseId Id of base
   */
  private findAllByBaseId(baseId: number): Promise<Array<Knowledge>> {
    return new Promise((resolve, reject) => {
      this.knowledge_base_id = baseId;
      super
        .findAll(null, { index: 'index1', value: baseId })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject();
        });
    });
  }
}
