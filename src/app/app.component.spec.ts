import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { AppDataService } from './services/app-data.service';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { LanguagesService } from './services/languages.service';

@Component({
  selector: 'app-header',
  template: '',
  standalone: false,
})
class HeaderStubComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule],
      declarations: [AppComponent, HeaderStubComponent],
      providers: [
        { provide: HttpClient, useValue: {} },
        {
          provide: KnowledgeBaseService,
          useValue: { loadData: jasmine.createSpy('loadData') },
        },
        {
          provide: LanguagesService,
          useValue: {
            initLanguages: jasmine.createSpy('initLanguages'),
            getOrSetCurrentLanguage: jasmine.createSpy(
              'getOrSetCurrentLanguage'
            ),
          },
        },
        { provide: AppDataService, useValue: { contrastMode: false } },
      ],
    }).compileComponents();
  });

  it('creates the application shell and initializes its data', () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
    expect(TestBed.inject(KnowledgeBaseService).loadData).toHaveBeenCalledWith(
      TestBed.inject(HttpClient)
    );
    expect(TestBed.inject(LanguagesService).initLanguages).toHaveBeenCalled();
    expect(
      TestBed.inject(LanguagesService).getOrSetCurrentLanguage
    ).toHaveBeenCalled();
  });

  it('applies contrast mode from app data', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main');

    expect(main.classList).not.toContain('pia-contrast');

    fixture.componentInstance.appDataService.contrastMode = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(main.classList).toContain('pia-contrast');
  });
});
