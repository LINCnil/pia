import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class AppDataService {

  public dataNav = { sections: null };

  constructor(private http: Http) {
    this.loadArchitecture();
  }

  /**
   * Get the navigation data.
   * @returns {Object}
   * @memberof AppDataService
   */
  async getDataNav() {
    if (!this.dataNav.sections) {
      await this.loadArchitecture();
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
      this.http.get('./assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
        this.dataNav = data;
        resolve();
      });
    });
  }
}
