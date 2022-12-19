import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDb } from '../application.db';
import { Evaluation } from '../models/evaluation.model';
import { ApiService } from './api.service';

@Injectable()
export class EvaluationService extends ApplicationDb {
  constructor(private router: Router, protected apiService: ApiService) {
    super(201707071818, 'evaluation');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  async create(evaluation: Evaluation): Promise<Evaluation> {
    const data = {
      ...evaluation,
      created_at: new Date()
    };

    return new Promise((resolve, reject) => {
      super
        .create(data, null, this.setFormData(data))
        .then((result: any) => {
          resolve(result.id);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  async update(evaluation: Evaluation): Promise<any> {
    return new Promise((resolve, reject) => {
      super
        .find(evaluation.id)
        .then((entry: any) => {
          console.log(entry.id);
          entry = {
            ...entry,
            ...evaluation
          };
          entry.updated_at = new Date();
          super
            .update(entry.id, entry, null, this.setFormData(entry))
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  private setFormData(data) {
    const formData = new FormData();
    for (const d in data) {
      if (data.hasOwnProperty(d) && data[d]) {
        if (d === 'gauges') {
          for (const dd in data[d]) {
            if (data[d].hasOwnProperty(dd) && data[d][dd]) {
              formData.append('evaluation[' + d + '][' + dd + ']', data[d][dd]);
            }
          }
        } else {
          formData.append('evaluation[' + d + ']', data[d]);
        }
      }
    }
    return formData;
  }

  /* Get an evaluation for a specific question or a specific measure */
  async getByReference(pia_id: number, reference_to: any): Promise<any> {
    return new Promise((resolve, reject) => {
      super
        .findWithReference('?reference_to=' + reference_to, {
          index: 'index1',
          value: [pia_id, reference_to]
        })
        .then((result: any) => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async findAllByPia(pia_id: number) {
    const items = [];
    return new Promise((resolve, reject) => {
      this.pia_id = pia_id;
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

  async existByReference(pia_id: number, reference_to: any) {
    return new Promise((resolve, reject) => {
      super
        .findWithReference('?reference_to=' + reference_to, {
          index: 'index1',
          value: [pia_id, reference_to]
        })
        .then((result: any) => {
          if (result && result.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  async globalStatusByReference(
    pia_id: number,
    reference_to: any,
    global_status: number
  ) {
    return new Promise((resolve, reject) => {
      super
        .findWithReference('?reference_to=' + reference_to, {
          index: 'index1',
          value: [pia_id, reference_to]
        })
        .then((result: any) => {
          if (result) {
            resolve(result.global_status === global_status);
          } else {
            resolve(false);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  getStatusName(status) {
    return 'evaluations.status.' + status;
  }
}
