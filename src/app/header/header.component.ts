import { Component, ElementRef, OnInit } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Pia } from 'src/app/entry/pia.model';

import { TranslateService } from '@ngx-translate/core';
import { PiaService } from 'src/app/services/pia.service';
import { ModalsService } from 'src/app/modals/modals.service';
import { LanguagesService } from 'src/app/services/languages.service';

import piaExample from 'src/assets/files/2018-02-21-pia-example.json';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [PiaService]
})
export class HeaderComponent implements OnInit {
  public increaseContrast: string;
  appVersion: string;
  pia_is_example: boolean;
  pia_example: Pia;
  isKnowledgeHeader: boolean;
  isStructureHeader: boolean;
  isArchiveHeader: boolean;

  constructor(
    public _router: Router,
    private renderer: Renderer2,
    private _translateService: TranslateService,
    public _piaService: PiaService,
    private _modalsService: ModalsService,
    private httpClient: HttpClient,
    public _languagesService: LanguagesService
  ) {
    this.updateContrast();
  }

  ngOnInit() {
    const displayMessage = document.querySelector('.pia-closeFullScreenModeAlertBlock');
    window.screenTop === 0 && window.screenY === 0 ? displayMessage.classList.remove('hide') : displayMessage.classList.add('hide');
    window.onresize = () => {
      window.screenTop === 0 && window.screenY === 0 ? displayMessage.classList.remove('hide') : displayMessage.classList.add('hide');
    };
    this.appVersion = environment.version;
    this.pia_is_example = false;
    this._piaService.getPIA().then(() => {
      if (this._piaService.pia.is_example === 1) {
        this.pia_example = this._piaService.pia;
        this.pia_is_example = true;
      } else if (!this._piaService.pia.id) {
        this.loadPiaExample();
      }
    });
    if (this._router.url.indexOf('/structures/') > -1) {
      this.isStructureHeader = true;
    }
    if (this._router.url.indexOf('/archives/') > -1) {
      this.isArchiveHeader = true;
    }
    if (this._router.url.indexOf('/knowledges') > -1) {
      this.isKnowledgeHeader = true;
    }
  }

  /**
   * Manually updates the contrast. Can be executed by users through header.
   * @param {any} event - Any kind of event.
   */
  changeContrast(event: any) {
    localStorage.setItem('increaseContrast', event.target.checked);
    this.updateContrast();
  }

  /**
   * Updates colors contrast on the whole application for people with visual disabilities.
   * @private
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
   */
  private loadPiaExample() {
    const pia = new Pia();
    pia.getPiaExample().then((entry: any) => {
      if (entry) {
        this.pia_example = entry;
      } else {
        this._piaService.importData(piaExample, 'EXAMPLE', false, true).then(() => {
          pia.getPiaExample().then((entry2: any) => {
            this.pia_example = entry2;
          });
        });
      }
    });
  }
}
