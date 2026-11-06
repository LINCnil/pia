import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EntriesModule } from 'src/app/modules/entries/entries.module';
import {
  ComponentTestData,
  createComponentTestData,
} from 'src/app/testing/component-test-data';
import {
  mockComponentServices,
  setComponentTestRoute,
} from 'src/app/testing/component-test-services';
import { ArchiveCardComponent } from './archive-card.component';

describe('ArchiveCardComponent', () => {
  let component: ArchiveCardComponent;
  let fixture: ComponentFixture<ArchiveCardComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'ArchiveService',
      'AttachmentsService',
      'AuthService',
      'DialogService',
      'LanguagesService',
      'PiaService'
    );
    await TestBed.configureTestingModule({
      imports: [EntriesModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(ArchiveCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('archivedPia', data.pia);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
