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
import { KnowledgebaseCardComponent } from './knowledgebase-card.component';

describe('KnowledgebaseCardComponent', () => {
  let component: KnowledgebaseCardComponent;
  let fixture: ComponentFixture<KnowledgebaseCardComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'DialogService',
      'KnowledgeBaseService',
      'KnowledgesService'
    );
    await TestBed.configureTestingModule({
      imports: [EntriesModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(KnowledgebaseCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('base', data.base);
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
