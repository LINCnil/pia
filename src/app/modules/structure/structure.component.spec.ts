import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { StructureModule } from 'src/app/modules/structure/structure.module';
import {
  ComponentTestData,
  createComponentTestData,
} from 'src/app/testing/component-test-data';
import {
  mockComponentServices,
  setComponentTestRoute,
} from 'src/app/testing/component-test-services';
import { StructureComponent } from './structure.component';

describe('StructureComponent', () => {
  let component: StructureComponent;
  let fixture: ComponentFixture<StructureComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'ActionPlanService',
      'AnswerStructureService',
      'AppDataService',
      'DialogService',
      'GlobalEvaluationService',
      'KnowledgeBaseService',
      'LanguagesService',
      'MeasureService',
      'SidStatusService',
      'StructureService'
    );
    await TestBed.configureTestingModule({
      imports: [
        StructureModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(StructureComponent);
    component = fixture.componentInstance;
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
