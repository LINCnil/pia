import { Component, DoCheck, OnInit } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { environment } from '../../environments/environment';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, DoCheck {
  public increaseContrast: String;
  appVersion: string;
  selectedLanguage: string;

  constructor(private renderer: Renderer2, private _translateService: TranslateService) {
    this.updateContrast();
  }

  ngOnInit() {
    this.appVersion = environment.version;
    this.getUserLanguage();
  }

  ngDoCheck() {
    this.getUserLanguage();
  }

  /**
   * Manually updates the contrast. Can be executed by users through header.
   * @param {any} event - Any kind of event
   * @memberof HeaderComponent
   */
  changeContrast(event: any) {
    localStorage.setItem('increaseContrast', event.target.checked);
    this.updateContrast();
  }

  /**
   * Record the selected language
   * @param {string} selectedLanguage
   * @memberof HeaderComponent
   */
  updateCurrentLanguage(selectedLanguage: string) {
    localStorage.setItem('userLanguage', selectedLanguage);
  }

  /**
   * Retrieve the selected language
   * @memberof HeaderComponent
   */
  getUserLanguage() {
    const language = localStorage.getItem('userLanguage');
    if (language && language.length > 0) {
      this.selectedLanguage = language;
    } else {
      const browserLang = this._translateService.getBrowserLang();
      this.selectedLanguage = browserLang.match(/en|fr/) ? browserLang : 'fr';
    }
  }

  /**
   * Updates colors contrast on the whole application for people with visual disabilities.
   * @private
   * @memberof HeaderComponent
   */
  private updateContrast() {
    this.increaseContrast = localStorage.getItem('increaseContrast');
    if (this.increaseContrast === 'true') {
      this.renderer.addClass(document.body, 'pia-contrast');
    } else {
      this.renderer.removeClass(document.body, 'pia-contrast');
    }
  }
}
