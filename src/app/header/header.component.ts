import { Component, DoCheck, OnInit } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import { Pia } from 'app/entry/pia.model';

import { TranslateService } from '@ngx-translate/core';
import { PiaService } from 'app/entry/pia.service';
import { ModalsService } from 'app/modals/modals.service';
import { LanguagesService } from 'app/services/languages.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [PiaService],
})
export class HeaderComponent implements OnInit {
  public increaseContrast: string;
  appVersion: string;
  headerForHome: boolean;

  constructor(private _router: Router,
              private renderer: Renderer2,
              private _translateService: TranslateService,
              public _piaService: PiaService,
              private _modalsService: ModalsService,
              private _http: Http,
              public _languagesService: LanguagesService) {
    this.updateContrast();
  }

  ngOnInit() {
    this.appVersion = environment.version;

    // Set the visibility for the PIA example button according to the current url
    this.headerForHome = (this._router.url === '/home/card' ||
                          this._router.url === '/home/list' ||
                          this._router.url === '/about' ||
                          this._router.url === '/help' ||
                          this._router.url === '/settings') ? true : false;
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
