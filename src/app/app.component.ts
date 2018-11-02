import { Component, Renderer2 } from '@angular/core';
import { Http } from '@angular/http';

import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { LanguagesService } from 'app/services/languages.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private _renderer: Renderer2,
              private _http: Http,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _languagesService: LanguagesService) {
    this._knowledgeBaseService.loadData(this._http);
    const increaseContrast = localStorage.getItem('increaseContrast');
    if (increaseContrast === 'true') {
      this._renderer.addClass(document.body, 'pia-contrast');
    } else {
      this._renderer.removeClass(document.body, 'pia-contrast');
    }

    // Languages initialization
    this._languagesService.initLanguages();
    this._languagesService.getOrSetCurrentLanguage();

  }
}
