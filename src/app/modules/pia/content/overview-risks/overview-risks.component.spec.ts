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
import { OverviewRisksComponent } from './overview-risks.component';

describe('OverviewRisksComponent', () => {
  let component: OverviewRisksComponent;
  let fixture: ComponentFixture<OverviewRisksComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(data, 'AnswerService', 'AppDataService');
    await TestBed.configureTestingModule({
      imports: [PiaModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(OverviewRisksComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pia', data.pia);
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
