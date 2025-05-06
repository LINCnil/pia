import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDb } from '../application.db';
import { Comment } from '../models/comment.model';
import { ApiService } from './api.service';

@Injectable()
export class CommentsService extends ApplicationDb {
  constructor(private router: Router, protected apiService: ApiService) {
    super(201709122303, 'comment');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  async create(comment: Comment): Promise<any> {
    comment.created_at = new Date();
    const data = {
      ...comment
    };
    return new Promise((resolve, reject) => {
      super
        .create(data, 'comment')
        .then((result: any) => {
          resolve(result.id);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  async findAllByPia(pia_id: number): Promise<Array<Comment>> {
    return new Promise((resolve, reject) => {
      this.pia_id = pia_id;
      super
        .findAll(null, { index: 'index2', value: pia_id })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async findAllByReference(piaId: number, referenceTo: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pia_id = piaId;
      this.findAll('?reference_to=' + referenceTo, {
        index: 'index1',
        value: [piaId, referenceTo]
      })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject();
        });
    });
  }

  async update(comment: Comment): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(comment.id).then((entry: any) => {
        entry = {
          ...entry,
          ...comment
        };
        entry.updated_at = new Date(entry.updated_at);
        // update indexDB / comment
        this.getObjectStore().then(() => {
          const evt = this.objectStore.put(entry);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          };
          evt.onsuccess = () => {
            resolve(true);
          };
        });
      });
    });
  }
}
