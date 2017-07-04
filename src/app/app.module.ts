import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { CardsComponent } from './cards/cards.component';
import { FiltersComponent } from './filters/filters.component';
import { CardItemComponent } from './cards/card-item/card-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import { EntryComponent } from './entry/entry.component';
import { SectionsComponent } from './entry/sections/sections.component';
import { AttachmentsComponent } from './entry/attachments/attachments.component';
import { EntryContentComponent } from './entry/entry-content/entry-content.component';
import { KnowledgeBaseComponent } from './entry/knowledge-base/knowledge-base.component';
import { KnowledgeBaseFiltersComponent } from './entry/knowledge-base/knowledge-base-filters/knowledge-base-filters.component';
import { KnowledgeBaseItemComponent } from './entry/knowledge-base/knowledge-base-item/knowledge-base-item.component';
import { KnowledgeBaseSearchComponent } from './entry/knowledge-base/knowledge-base-search/knowledge-base-search.component';
import { AttachmentItemComponent } from './entry/attachments/attachment-item/attachment-item.component';

const appRoutes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'home', component: CardsComponent },
  { path: 'entry/:id', component: EntryComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuthenticationComponent,
    CardsComponent,
    FiltersComponent,
    CardItemComponent,
    EntryComponent,
    SectionsComponent,
    AttachmentsComponent,
    EntryContentComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseFiltersComponent,
    KnowledgeBaseItemComponent,
    KnowledgeBaseSearchComponent,
    AttachmentItemComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }