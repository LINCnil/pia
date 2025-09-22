import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  standalone: false
})
export class HelpComponent implements OnInit {
  public tableOfTitles = [];
  public content;
  public activeElement: string;
  private helpSubscription: Subscription;

  constructor(
    private httpClient: HttpClient,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    const language = this.translateService.currentLang;
    let fileTranslation;
    switch (language) {
      case 'fr':
        fileTranslation = 'fr';
        break;
      case 'zh':
        fileTranslation = 'zh';
        break;
      default:
        fileTranslation = 'en';
    }
    let file = `./assets/files/pia_help_${fileTranslation}.html`;

    this.httpClient.get(file, { responseType: 'text' }).subscribe(res => {
      this.content = res;
      this.getSectionList();
    });

    this.helpSubscription = this.translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        switch (event['lang']) {
          case 'fr':
            fileTranslation = 'fr';
            break;
          case 'zh':
            fileTranslation = 'zh';
            break;
          default:
            fileTranslation = 'en';
        }
        file = `./assets/files/pia_help_${fileTranslation}.html`;
        this.httpClient.get(file, { responseType: 'text' }).subscribe(res => {
          this.content = res;
          this.getSectionList();
        });
      }
    );

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
}
