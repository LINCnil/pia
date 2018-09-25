import { Component, DoCheck, OnInit } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import { Pia } from 'app/entry/pia.model';

import { TranslateService } from '@ngx-translate/core';
import { PiaService } from 'app/services/pia.service';
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
  pia_is_example: boolean;
  pia_example: Pia;
  isStructureHeader: boolean;

  constructor(public _router: Router,
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
    this.pia_is_example = false;
    this._piaService.getPIA().then(() => {
      if (this._piaService.pia.is_example === 1) {
        this.pia_is_example = true;
        this.pia_example = this._piaService.pia;
      } else if (!this._piaService.pia.id) {
        this.loadPiaExample();
      }
    });
    if (this._router.url.indexOf('/structures/') > -1) {
      this.isStructureHeader = true;
    }
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
   * Get or Load PIA example.
   * @private
   * @memberof HeaderComponent
   */
  private loadPiaExample() {
    const pia = new Pia();
    pia.getPiaExample().then((entry: any) => {
      if (entry) {
        this.pia_example = entry;
      } else {
        this._http.get('./assets/files/2018-02-21-pia-example.json').map(res => res.json()).subscribe(data => {
          this._piaService.importData(data, 'EXAMPLE', false, true).then(() => {
            pia.getPiaExample().then((entry2: any) => {
              this.pia_example = entry2;
            });
          });
        });
      }
    });
  }
}
