import { Injectable } from '@angular/core';

import piaArchitecture from 'src/assets/files/pia_architecture.json';

@Injectable()
export class AppDataService {
  public dataNav = piaArchitecture;
  public entrieMode = 'pia'; // Color mode for header
  public contrastMode = false;

  constructor() {
    this.contrastMode = (localStorage.getItem('increaseContrast') === 'true');
  }

  resetDataNav(): void {
    this.dataNav = piaArchitecture;
  }
}
