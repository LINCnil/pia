import { Component, DoCheck, OnInit } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import { Pia } from 'app/entry/pia.model';

import { TranslateService } from '@ngx-translate/core';
import { PiaService } from 'app/entry/pia.service';
import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [PiaService],
})
export class HeaderComponent implements OnInit, DoCheck {
  public increaseContrast: string;
  appVersion: string;
  selectedLanguage: string;
  headerForHome: boolean;

  constructor(private _router: Router,
              private renderer: Renderer2,
              private _translateService: TranslateService,
              public _piaService: PiaService,
              private _modalsService: ModalsService,
              private _http: Http) {
    this.updateContrast();
  }

  ngOnInit() {
    this.appVersion = environment.version;
    this.getUserLanguage();

    // Set the visibility for the PIA example button according to the current url
    this.headerForHome = (this._router.url === '/home/card' ||
                          this._router.url === '/home/list' ||
                          this._router.url === '/about' ||
                          this._router.url === '/settings') ? true : false;
  }

  ngDoCheck() {
    this.getUserLanguage();
  }

  /**
   * Manually updates the contrast. Can be executed by users through header.
   * @param {any} event - Any kind of event.
   * @memberof HeaderComponent
   */
  changeContrast(event: any) {
    localStorage.setItem('increaseContrast', event.target.checked);
    this.updateContrast();
  }

  /**
   * Record the selected language.
   * @param {string} selectedLanguage
   * @memberof HeaderComponent
   */
  updateCurrentLanguage(selectedLanguage: string) {
    localStorage.setItem('userLanguage', selectedLanguage);
    this._translateService.use(selectedLanguage);
  }

  /**
   * Retrieve the selected language.
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

  /**
   * Import PIA example.
   * @returns {Promise}
   * @memberof HeaderComponent
   */
  importPiaExample() {
    return new Promise((resolve, reject) => {
      const pia = new Pia();
      pia.getPiaExample().then((entry: any) => {
        if (entry) {
          this._router.navigate(['entry', entry.id, 'section', 1, 'item', 1]);
        } else {
          this._http.get('./assets/files/2018-02-21-pia-example.json').map(res => res.json()).subscribe(data => {
            this._piaService.importData(data, 'EXAMPLE', false, true).then(() => {
              pia.getPiaExample().then((entry2: any) => {
                this._router.navigate(['entry', entry2.id, 'section', 1, 'item', 1]);
              });
            });

            resolve();
          });
        }
      });
    });
  }
}
