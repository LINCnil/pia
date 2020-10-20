import { Injectable } from '@angular/core';

import piaArchitecture from 'src/assets/files/pia_architecture.json';

@Injectable()
export class AppDataService {
  public dataNav = piaArchitecture;
  public entrieMode = 'pia'; // Color mode for header

  resetDataNav(): void {
    this.dataNav = piaArchitecture;
  }
}
