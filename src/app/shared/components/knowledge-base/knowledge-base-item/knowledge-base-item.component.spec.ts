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
import { KnowledgeBaseItemComponent } from './knowledge-base-item.component';

describe('KnowledgeBaseItemComponent', () => {
  let component: KnowledgeBaseItemComponent;
  let fixture: ComponentFixture<KnowledgeBaseItemComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'GlobalEvaluationService',
      'KnowledgeBaseService'
    );
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(KnowledgeBaseItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', data.item);
    fixture.componentRef.setInput('itemKb', data.itemKb);
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
