import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PiaModule } from 'src/app/modules/pia/pia.module';
import {
  ComponentTestData,
  createComponentTestData,
} from 'src/app/testing/component-test-data';
import {
  mockComponentServices,
  setComponentTestRoute,
} from 'src/app/testing/component-test-services';
import { PiaComponent } from './pia.component';

describe('PiaComponent', () => {
  let component: PiaComponent;
  let fixture: ComponentFixture<PiaComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'ActionPlanService',
      'AnswerService',
      'ApiService',
      'AppDataService',
      'AttachmentsService',
      'AuthService',
      'CommentsService',
      'DialogService',
      'EvaluationService',
      'GlobalEvaluationService',
      'IntrojsService',
      'KnowledgeBaseService',
      'LanguagesService',
      'MeasureService',
      'PaginationService',
      'PiaService',
      'RevisionService',
      'SidStatusService',
      'StructureService'
    );
    await TestBed.configureTestingModule({
      imports: [PiaModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(PiaComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('loads the assessment and its current section', () => {
    expect(component.pia).toBe(data.pia);
    expect(component.section).toBe(data.section);
    expect(fixture.nativeElement.querySelector('app-sections')).not.toBeNull();
  });
});
