import { Component, OnInit, Input } from '@angular/core';
import 'rxjs/add/operator/map';

import { Evaluation } from 'src/app/entry/entry-content/evaluations/evaluation.model';
import { Measure } from 'src/app/entry/entry-content/measures/measure.model';
import { Answer } from 'src/app/entry/entry-content/questions/answer.model';

import { AppDataService } from 'src/app/services/app-data.service';
import { PiaService } from 'src/app/services/pia.service';

@Component({
  selector: 'app-preview-sections',
  templateUrl: './preview-sections.component.html',
  styleUrls: ['./preview-sections.component.scss'],
  providers: [PiaService]
})
export class PreviewSectionsComponent implements OnInit {

  @Input() section: { id: number, title: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  data: { sections: any };
  public activeElement: string;

  constructor(public _piaService: PiaService,
              private _appDataService: AppDataService) {
  }

  async ngOnInit() {
    await this._piaService.getPIA();
    this.data = this._appDataService.dataNav;
  }

  /**
   * Jump to the title/subtitle clicked.
   * @param {any} event - Any Event.
   * @param {any} text - The title or subtitle.
   */
  getAnchor(event, text) {
    event.preventDefault();
    this.activeElement = text;
    const allSubtitles = document.querySelectorAll('h3');
    [].forEach.call(allSubtitles, (el, i) => {
      if (el.innerText === this.activeElement) {
        el.scrollIntoView();
      }
    });
  }
}
