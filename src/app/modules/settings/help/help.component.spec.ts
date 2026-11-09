import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SettingsModule } from 'src/app/modules/settings/settings.module';
import { setComponentTestRoute } from 'src/app/testing/component-test-services';
import { HelpComponent } from './help.component';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;
  let httpGet: jasmine.Spy;
  let previousScroll: typeof window.onscroll;

  beforeEach(async () => {
    previousScroll = window.onscroll;
    httpGet = jasmine
      .createSpy('get')
      .and.callFake((path: string) =>
        of(
          path.endsWith('_fr.html')
            ? '<h2>Prise en main</h2>\n<h3>Ouvrir une PIA</h3>'
            : '<h2>Getting started</h2>\n<h3>Opening a PIA</h3>'
        )
      );
    TestBed.overrideProvider(HttpClient, { useValue: { get: httpGet } });
    await TestBed.configureTestingModule({
      imports: [SettingsModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    window.onscroll = previousScroll;
  });

  it('loads the help content and builds the navigation', () => {
    expect(httpGet).toHaveBeenCalledWith('./assets/files/pia_help_en.html', {
      responseType: 'text',
    });
    expect(component.tableOfTitles).toEqual([
      ['Getting started', ['Opening a PIA']],
    ]);
    expect(
      fixture.nativeElement.querySelector('.pia-helpBlock-content h2')
        .textContent
    ).toBe('Getting started');
    expect(
      fixture.nativeElement
        .querySelector('.pia-sectionBlock-list a')
        .textContent.trim()
    ).toBe('Opening a PIA');
  });

  it('loads the translated help when the language changes', () => {
    TestBed.inject(TranslateService).use('fr');
    fixture.detectChanges();

    expect(httpGet).toHaveBeenCalledWith('./assets/files/pia_help_fr.html', {
      responseType: 'text',
    });
    expect(component.tableOfTitles).toEqual([
      ['Prise en main', ['Ouvrir une PIA']],
    ]);
    expect(
      fixture.nativeElement.querySelector('.pia-helpBlock-content h2')
        .textContent
    ).toBe('Prise en main');
  });
});
