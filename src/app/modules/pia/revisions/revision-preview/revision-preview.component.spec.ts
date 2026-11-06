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
import { RevisionPreviewComponent } from './revision-preview.component';

describe('RevisionPreviewComponent', () => {
  let component: RevisionPreviewComponent;
  let fixture: ComponentFixture<RevisionPreviewComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'AppDataService',
      'AuthService',
      'DialogService',
      'EvaluationService',
      'PiaService',
      'RevisionService',
      'SidStatusService'
    );
    await TestBed.configureTestingModule({
      imports: [PiaModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(RevisionPreviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('revision', data.revision);
    fixture.componentRef.setInput('date', data.revision.created_at);
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
