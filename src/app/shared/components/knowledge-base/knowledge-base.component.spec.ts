import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import {
  ComponentTestData,
  createComponentTestData,
} from 'src/app/testing/component-test-data';
import {
  mockComponentServices,
  setComponentTestRoute,
} from 'src/app/testing/component-test-services';
import { KnowledgeBaseComponent } from './knowledge-base.component';

describe('KnowledgeBaseComponent', () => {
  let component: KnowledgeBaseComponent;
  let fixture: ComponentFixture<KnowledgeBaseComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'KnowledgeBaseService',
      'MeasureService',
      'StructureService'
    );
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(KnowledgeBaseComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', data.item);
    fixture.componentRef.setInput('structure', data.structure);
    fixture.componentRef.setInput('pia', data.pia);
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
