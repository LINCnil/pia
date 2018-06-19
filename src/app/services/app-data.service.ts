import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { PiaModel } from '@api/models';
import { PiaType } from '@api/model/pia.model';

@Injectable()
export class AppDataService {

  private dataNav = { sections: null };

  constructor(private http: HttpClient) {
    this.loadArchitecture();
  }

  /**
   * Get the navigation data.
   * @returns {Object}
   * @memberof AppDataService
   */
  async getDataNav(pia?: PiaModel) {
    await this.loadArchitecture();
    
    if(pia) {
      if(pia.type == PiaType.regular) {
        delete this.dataNav.sections[3];
        delete this.dataNav.sections[2];
      }

      if(pia.type === PiaType.simplified) {
        delete this.dataNav.sections[3];
        delete this.dataNav.sections[2];
        delete this.dataNav.sections[1];
      }

      this.dataNav.sections = Object.values(this.dataNav.sections);
    }

    return this.dataNav;
  }

  /**
   * Load the architecture JSON file.
   * @private
   * @returns {Promise}
   * @memberof AppDataService
   */
  private async loadArchitecture() {
    return new Promise((resolve, reject) => {
      this.http.get<any>('./assets/files/pia_architecture.json').subscribe(data => {
        this.dataNav = data;
        resolve();
      });
    });
  }
}
