import { Component, OnInit, DoCheck } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit, DoCheck {
  selectedLanguage: string;

  constructor(private _translateService: TranslateService) { }

  ngOnInit() {
    this.getUserLanguage();
  }

  ngDoCheck() {
    this.getUserLanguage();
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
}
