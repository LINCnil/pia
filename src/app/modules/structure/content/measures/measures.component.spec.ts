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
import { MeasuresComponent } from './measures.component';

describe('MeasuresComponent', () => {
  let component: MeasuresComponent;
  let fixture: ComponentFixture<MeasuresComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'AnswerStructureService',
      'DialogService',
      'GlobalEvaluationService',
      'KnowledgeBaseService',
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

    fixture = TestBed.createComponent(MeasuresComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', data.measure.id);
    fixture.componentRef.setInput('measure', data.measure);
    fixture.componentRef.setInput('item', data.item);
    fixture.componentRef.setInput('section', data.section);
    fixture.componentRef.setInput('structure', data.structure);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
