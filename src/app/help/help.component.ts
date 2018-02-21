import {Component, OnInit } from '@angular/core';
import { MarkdownService } from 'angular2-markdown';
import {Http} from '@angular/http';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  private titleLists = [];
  private subtitleLists = [];
  private currentAnchorId: string
  constructor(private http: Http, private _markdown: MarkdownService) {  }

  ngOnInit() {
    this._markdown.renderer.blockquote = (quote: string) => {
      return `<blockquote class="king-quote">${quote}</blockquote>`;
    };
    this.getSectionList();

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

  getSectionList() {
    return new Promise(resolve => {
      this.http.get('assets/files/pia_help_fr.md').subscribe(data => {
        const fileMd = data.text().toString();
        const reg1 = new RegExp('^(##) [A-Za-z 1-9]+', 'gm');
        const reg2 = new RegExp('^(###) [A-Za-z 1-9]+', 'gm');
        const titleLists = this.titleLists;
        fileMd.match(reg1).forEach(function (titleH2) {
          titleLists.push(titleH2.toString().replace('##', ''))
        });
        const subtitleLists = this.subtitleLists;
        fileMd.match(reg2).forEach(function (titleH3) {
          subtitleLists.push(titleH3.toString().replace('###', ''))
        });
      })
    });
  }
   getAnchor(event) {
    event.preventDefault();
     if (event.target) {
       const reg3 = new RegExp('^()[A-Za-z 1-9]+', 'gm');
       event.target.forEach(function (item) {
         console.log(item);
       });

       console.log(this.currentAnchorId);
     }
   }
}
