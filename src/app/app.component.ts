import { HttpClient } from '@angular/common/http';
import { Renderer2, Component } from '@angular/core';
import { AppDataService } from './services/app-data.service';
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
              private languagesService: LanguagesService,
              public appDataService: AppDataService) {

    this.knowledgeBaseService.loadData(this.http);

    // const increaseContrast = this.appDataService.contrastMode;

    // if (increaseContrast) {
    //   this.renderer.addClass(document.body, 'pia-contrast');
    // } else {
    //   this.renderer.removeClass(document.body, 'pia-contrast');
    // }

    // Languages initialization
    this.languagesService.initLanguages();
    this.languagesService.getOrSetCurrentLanguage();
  }
}
