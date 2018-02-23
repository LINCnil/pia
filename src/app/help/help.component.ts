import {Component, OnInit } from '@angular/core';
import { MarkdownService } from 'angular2-markdown';
import {Http} from '@angular/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  private tableOfTitles = [];
  private currentAnchorId: string
  public activeElement: string;
  constructor(private http: Http, 
              private _markdown: MarkdownService, 
              private _translateService: TranslateService)
              {  }

  ngOnInit() {
    this._markdown.renderer.blockquote = (quote: string) => {
      return `<blockquote class="king-quote">${quote}</blockquote>`;
    };
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
    const cleanTarget = text.trim().toLowerCase().replace(/\s/g, '-');
    document.getElementById(cleanTarget).scrollIntoView();
  }

  getSectionList() {
    return new Promise(resolve => {
      this.http.get(`assets/files/pia_help_fr.md`).subscribe(data => {
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
    });
  }
}
/* let previousLine = '';
        for(let i=0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('###')) {
            this.listsTable[previousLine].push(line.replace('###', '').trim());
          } else if (line.startsWith('##')) { 
            this.listsTable[line] = [];
            previousLine = line;
          }
        }
        console.log(this.listsTable); */