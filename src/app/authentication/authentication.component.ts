import { Component, OnInit, DoCheck, OnDestroy } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit, DoCheck, OnDestroy {
  selectedLanguage: string;

  constructor(private _renderer: Renderer2, public _translateService: TranslateService) {
    this._renderer.addClass(document.body, 'pia-authentication');
  }

  ngOnInit() {
    this.getUserLanguage();
  }

  ngDoCheck() {
    this.getUserLanguage();
  }

  ngOnDestroy() {
    this._renderer.removeClass(document.body, 'pia-authentication');
  }

  /**
   * Record the selected language
   * @param {string} selectedLanguage
   * @memberof HeaderComponent
   */
  updateCurrentLanguage(selectedLanguage: string) {
    localStorage.setItem('userLanguage', selectedLanguage);
    this._translateService.use(selectedLanguage);
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
      this.selectedLanguage = browserLang.match(/en|cs|it|nl|fr|pl|de|es/) ? browserLang : 'fr';
    }
  }
}
