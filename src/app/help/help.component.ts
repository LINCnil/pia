import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  public tableOfTitles = [];
  public file;
  private currentAnchorId: string
  public activeElement: string;
  constructor(private http: Http,
              private _translateService: TranslateService) {}

  ngOnInit() {
    this.tableOfTitles = [];
    const language = this._translateService.currentLang;
    this.file = `/assets/files/pia_help_${language}.md`;
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
    console.log(cleanTarget);
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
}
