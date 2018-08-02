import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ProcessingModel } from '@api/models';

@Injectable()
export class ProcessingArchitectureService {

  private sections = null;

  constructor(private http: HttpClient) {
    this.loadArchitecture();
  }

  /**
   * Get the navigation data.
   * @returns {Object}
   * @memberof AppDataService
   */
  async getSections() {
    await this.loadArchitecture();

    return this.sections;
  }

  /**
   * Load the architecture JSON file.
   * @private
   * @returns {Promise}
   * @memberof AppDataService
   */
  private async loadArchitecture() {
    return new Promise((resolve, reject) => {
      this.http.get<any>('./assets/files/processing_architecture.json').subscribe(data => {
        this.sections = data;

        resolve();
      });
    });
  }
}
