import { Component, OnInit } from '@angular/core';

import { PiaService } from 'src/app/services/pia.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  providers: [PiaService]
})
export class PreviewComponent implements OnInit {
  public activeElement: string;
  data: { sections: any };

  constructor(private _translateService: TranslateService,
              private _piaService: PiaService,
              private _appDataService: AppDataService) {}

  async ngOnInit() {
    await this._piaService.getPIA();
    if (this._piaService.pia.structure_data) {
      this._appDataService.dataNav = this._piaService.pia.structure_data;
    }
    this.data = this._appDataService.dataNav;
  }

  /**
   * Jump to the title/subtitle clicked.
   * @param {any} event - Any Event.
   * @param {any} text - The title or subtitle.
   */
  getAnchor(event, text) {
    event.preventDefault();
    const allSubtitles = document.querySelectorAll('h2');
    allSubtitles.forEach.call(allSubtitles, (el, i) => {
      if (el.innerText === this._translateService.instant(text)) {
        el.parentNode.scrollIntoView({ behavior: "instant" });
      }
    });
  }

}
