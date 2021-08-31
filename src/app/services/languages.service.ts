import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LanguagesService {
  selectedLanguage: string;

  constructor(private translateService: TranslateService) {}

  /**
   * Initialize languages on the PIA tool
   */
  initLanguages(): void {
    this.translateService.addLangs([
      'en',
      'bg',
      'cz',
      'de',
      'dk',
      'el',
      'es',
      'et',
      'fi',
      'fr',
      'hr',
      'hu',
      'it',
      'lt',
      'nl',
      'no',
      'pl',
      'pt',
      'ro',
      'sl',
      'sv',
      'lv'
    ]);
    this.translateService.setDefaultLang('fr');
  }

  /**
   * Get the current language or set it
   */
  getOrSetCurrentLanguage(): void {
    let language = localStorage.getItem('userLanguage');
    // If there is already a language choosen
    if (language && language.length > 0) {
      this.translateService.use(language);
    } else {
      // Set default language
      const browserLang = this.translateService.getBrowserLang();
      language = browserLang.match(
        /en|bg|cz|de|dk|el|es|et|fi|fr|hr|hu|it|lt|nl|no|pl|pt|ro|sl|sv|lv/
      )
        ? browserLang
        : 'fr';
      this.translateService.use(language);
    }
    this.selectedLanguage = language;
  }

  /**
   * Update the current language after choosing a new one
   * @param {string} selectedLanguage
   */
  updateCurrentLanguage(selectedLanguage: string): void {
    localStorage.setItem('userLanguage', selectedLanguage);
    this.translateService.use(selectedLanguage);
    this.selectedLanguage = selectedLanguage;
  }
}
