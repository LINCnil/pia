import { Injectable } from "@angular/core";

import piaArchitecture from "src/assets/files/pia_architecture.json";

@Injectable()
export class AppDataService {
  public dataNav = piaArchitecture;

  resetDataNav() {
    this.dataNav = piaArchitecture;
  }
}
