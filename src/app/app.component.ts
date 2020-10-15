import { HttpClient } from '@angular/common/http';
import { Renderer2 } from '@angular/core';
import { Component } from '@angular/core';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { LanguagesService } from './services/languages.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private renderer: Renderer2,
              private http: HttpClient,
              private knowledgeBaseService: KnowledgeBaseService,
              private languagesService: LanguagesService) {

    this.knowledgeBaseService.loadData(this.http);

    const increaseContrast = localStorage.getItem('increaseContrast');

    if (increaseContrast === 'true') {
      this.renderer.addClass(document.body, 'pia-contrast');
    } else {
      this.renderer.removeClass(document.body, 'pia-contrast');
    }

    // Languages initialization
    this.languagesService.initLanguages();
    this.languagesService.getOrSetCurrentLanguage();
  }
}
