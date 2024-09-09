import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDb } from '../application.db';
import { Answer } from '../models/answer.model';
import { ApiService } from './api.service';

@Injectable()
export class AnswerService extends ApplicationDb {
  constructor(private router: Router, protected apiService: ApiService) {
    super(201707071818, 'answer');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  // TODO: Move Methods from model here
  async create(answer: Answer): Promise<Answer> {
    const data = {
      ...answer,
      created_at: new Date()
    };
    return new Promise((resolve, reject) => {
      super
        .create(data, null, this.setFormData(data))
        .then((result: any) => {
          answer.id = result.id;
          resolve(answer);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async update(answer: Answer): Promise<any> {
    return new Promise((resolve, reject) => {
      super
        .update(answer.id, answer, null, this.setFormData(answer))
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  private setFormData(data): FormData {
    const formData = new FormData();
    for (const d in data) {
      if (data.hasOwnProperty(d)) {
        if (data[d] instanceof Object) {
          for (const d2 in data[d]) {
            if (data[d].hasOwnProperty(d2)) {
              if (data[d][d2] instanceof Array) {
                for (const d3 in data[d][d2]) {
                  if (data[d].hasOwnProperty(d2)) {
                    if (data[d][d2][d3]) {
                      formData.append(
                        'answer[' + d + '][' + d2 + '][]',
                        data[d][d2][d3]
                      );
                    }
                  }
                }
              } else {
                if (data[d][d2]) {
                  formData.append('answer[' + d + '][' + d2 + ']', data[d][d2]);
                } else {
                  formData.append('answer[' + d + '][' + d2 + ']', '');
                }
              }
            }
          }
        } else {
          if (data[d] != null) {
            formData.append('answer[' + d + ']', data[d]);
          } else {
            formData.append('answer[' + d + ']', '');
          }
        }
      }
    }
    return formData;
  }

  async getByReferenceAndPia(pia_id: number, reference_to: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // TODO: CHECK THIS FOR INDEX DB
      super
        .findWithReference('?reference_to=' + reference_to, {
          index: 'index1',
          value: [pia_id, reference_to]
        })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject(error);
        });
    });
  }

  async findAllByPia(pia_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      super
        .findAll(null, { index: 'index2', value: pia_id })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          console.error('Request failed', error);
          reject();
        });
    });
  }

  async getGaugeByPia(pia_id: number): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      super
        .findAll(null, { index: 'index2', value: pia_id })
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
