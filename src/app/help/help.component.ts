import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit, OnDestroy {
  @ViewChild('pdfViewerAutoLoad', { static: false }) pdfViewerAutoLoad;

  public tableOfTitles = [];
  public content;
  public activeElement: string;
  private helpSubscription: Subscription;
  public pdfSrc; // = '/pdf-test.pdf';
  public displayInfografics: boolean;

  constructor(private httpClient: HttpClient, private _translateService: TranslateService, private el: ElementRef) {}

  ngOnInit() {
    const language = this._translateService.currentLang;
    let fileTranslation = language;
    switch (language) {
      case 'fr': {
        break;
      }
      case 'de': {
        break;
      }
      case 'el': {
        break;
      }
      default: {
        fileTranslation = 'en';
        break;
      }
    }
    let file = `./assets/files/pia_help_${fileTranslation}.html`;

    this.httpClient.get(file, { responseType: 'text' }).subscribe(res => {
      this.content = res;
      this.getSectionList();
    });

    this.helpSubscription = this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      let fileTranslation = event['lang'];
      switch (event['lang']) {
        case 'fr': {
          break;
        }
        case 'de': {
          break;
        }
        case 'el': {
          break;
        }
        default: {
          fileTranslation = 'en';
          break;
        }
      }
      file = `./assets/files/pia_help_${fileTranslation}.html`;
      this.httpClient.get(file, { responseType: 'text' }).subscribe(res => {
        this.content = res;
        this.getSectionList();
      });
    });

    window.onscroll = function(ev) {
      if (window.innerWidth > 640) {
        const el: any = document.querySelector('.pia-help-section');
        if (el) {
          if (window.scrollY >= 100) {
            el.setAttribute('style', 'width:283px;');
            el.classList.add('pia-help-section-scroll');
          } else {
            el.setAttribute('style', 'width:auto;');
            el.classList.remove('pia-help-section-scroll');
          }
        }
      }
    };
  }

  ngOnDestroy() {
    this.helpSubscription.unsubscribe();
  }

  /**
   * Jump to the title/subtitle clicked.
   * @param {any} event - Any Event.
   * @param {any} text - The title or subtitle.
   */
  getAnchor(event, text) {
    event.preventDefault();
    this.activeElement = text;
    const allSubtitles = document.querySelectorAll('h3');
    [].forEach.call(allSubtitles, (el, i) => {
      if (el.innerText === this.activeElement) {
        el.scrollIntoView();
      }
    });
  }

  /**
   * Parse the file to get all title and subtitle.
   */
  getSectionList() {
    this.tableOfTitles = [];
    const lines = this.content.split('\n');
    let tt = [];
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('<h3>')) {
        tt[1].push(line.replace(/<(\/?)h3>/g, '').trim());
      } else if (line.startsWith('<h2>')) {
        if (tt.length > 0) {
          this.tableOfTitles.push(tt);
        }
        tt = [line.replace(/<(\/?)h2>/g, '').trim(), []];
      }
    });
    if (tt.length > 0) {
      this.tableOfTitles.push(tt);
    }
  }

  /**
   * Display or hide the Infografics.
   * @memberof HelpComponent
   */
  toggleInfograficsContent(show: boolean) {
    const elPreview = this.el.nativeElement.querySelector('.pia-helpBlock-preview');
    const embed = elPreview.querySelector('#iframe');
    const img = elPreview.querySelector('img');

    if (show) {
      const el2 = document.getElementById('infografics_file');
      this.pdfSrc = el2.textContent;
      this.displayInfografics = true;
      elPreview.classList.remove('hide');
      img.classList.add('hide');
    } else {
      img.classList.remove('hide');
      elPreview.classList.add('hide');
      this.displayInfografics = false;
    }
  }
}
