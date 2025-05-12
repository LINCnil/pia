import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppDataService } from './services/app-data.service';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { LanguagesService } from './services/languages.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  constructor(
    private http: HttpClient,
    private knowledgeBaseService: KnowledgeBaseService,
    private languagesService: LanguagesService,
    public appDataService: AppDataService
  ) {
    this.knowledgeBaseService.loadData(this.http);
    this.languagesService.initLanguages();
    this.languagesService.getOrSetCurrentLanguage();
  }
}
