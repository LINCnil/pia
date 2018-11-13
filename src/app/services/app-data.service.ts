import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppDataService {
  public dataNav = { sections: null };

  constructor(private http: HttpClient) {
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
      this.http.get('./assets/files/pia_architecture.json').subscribe(data => {
        this.dataNav = data as any;
        resolve();
      });
    });
  }
}
