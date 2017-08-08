import { Component } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { Http } from '@angular/http';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  online = window.navigator.onLine;

  constructor(private renderer: Renderer2, private http: Http, private _knowledgeBaseService: KnowledgeBaseService) {
    this._knowledgeBaseService.loadData(this.http);
    const increaseContrast = localStorage.getItem('increaseContrast');
    if (increaseContrast === 'true') {
      this.renderer.addClass(document.body, 'pia-contrast');
    } else {
      this.renderer.removeClass(document.body, 'pia-contrast');
    }
  }
}
