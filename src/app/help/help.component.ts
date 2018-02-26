import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit, OnDestroy {
  public tableOfTitles = [];
  public file;
  private currentAnchorId: string
  public activeElement: string;
  private helpSubscription: Subscription;

  constructor(private http: Http,
              private _translateService: TranslateService) {}

  ngOnInit() {
    this.tableOfTitles = [];
    const language = this._translateService.currentLang;
    let fileTranslation = language  === 'fr' ? 'fr' : 'en';
    this.file = `./assets/files/pia_help_${fileTranslation}.md`;


    this.helpSubscription = this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      fileTranslation = event['lang'] === 'fr' ? 'fr' : 'en';
      this.file = `./assets/files/pia_help_${fileTranslation}.md`;
      this.tableOfTitles = [];
      this.getSectionList();
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
    this.getSectionList();
  }

  getAnchor(event, text) {
    event.preventDefault();
    this.activeElement = text;
    const cleanTarget = text.trim().toLowerCase().replace(/"/g, '').replace(/\W/g, '-').replace(/-{2}/g, '-');
    const element = document.getElementById(cleanTarget);
    if (element) {
      element.scrollIntoView();
    }
  }

  getSectionList() {
    this.http.get(this.file).subscribe(data => {
      const fileMd = data.text().toString();
      const lines = fileMd.split('\n');
      let tt = [];
      lines.forEach((line) => {
        line = line.trim();
        if (line.startsWith('###')) {
          tt[1].push(line.replace(/#/g, '').trim());
        } else if (line.startsWith('##')) {
          if (tt.length > 0) {
            this.tableOfTitles.push(tt);
          }
          tt = [line.replace(/#/g, '').trim(), []];
        }
      });
      if (tt.length > 0) {
        this.tableOfTitles.push(tt);
      }
    });
  }

    /**
   * Destroys help subscriber.
   */
  ngOnDestroy() {
    this.helpSubscription.unsubscribe();
  }
}
