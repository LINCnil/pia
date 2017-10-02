import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class AppDataService {

  private dataNav = { sections: null };

  constructor(private http: Http) {
    this.dataNav = { sections: null };
    this.loadArchitecture();
  }

  async getDataNav() {
    if (!this.dataNav.sections) {
      await this.loadArchitecture();
    }
    return this.dataNav;
  }

  private async loadArchitecture() {
    return new Promise((resolve, reject) => {
      this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
        this.dataNav = data;
        resolve();
      });
    });
  }
}
