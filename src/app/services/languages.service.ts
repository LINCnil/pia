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
      'ar',
      'bg',
      'cz',
      'de',
      'dk',
      'el',
      'en',
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
    // If a language has already been chosen
    if (language && language.length > 0) {
      this.translateService.use(language);
    } else {
      // Set default language
      const browserLang = this.translateService.getBrowserLang();
      language = browserLang.match(
        /ar|bg|cz|de|dk|el|en|es|et|fi|fr|hr|hu|it|lt|lv|nl|no|pl|pt|ro|sl|sv/
      )
        ? browserLang
        : 'fr';
      this.translateService.use(language);
    }
    this.selectedLanguage = language;
    this.useAdequateDirection(this.selectedLanguage);
  }

  /**
   * Update the current language after choosing a new one
   * @param {string} selectedLanguage
   */
  updateCurrentLanguage(selectedLanguage: string): void {
    localStorage.setItem('userLanguage', selectedLanguage);
    this.translateService.use(selectedLanguage);
    this.selectedLanguage = selectedLanguage;
    this.useAdequateDirection(this.selectedLanguage);
  }

  /**
   * Use LTR or RTL direction according to current language
   * @param selectedLanguage
   */
  useAdequateDirection(selectedLanguage: string): void {
    const htmlElement = document.getElementById('htmlElement');
    if (htmlElement) {
      if (selectedLanguage == 'ar') {
        htmlElement.setAttribute('dir', 'rtl');
      } else {
        htmlElement.setAttribute('dir', 'ltr');
      }
    }
  }
}
