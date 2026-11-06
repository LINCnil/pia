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
import { StructureCardComponent } from './structure-card.component';

describe('StructureCardComponent', () => {
  let component: StructureCardComponent;
  let fixture: ComponentFixture<StructureCardComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'DialogService',
      'LanguagesService',
      'PiaService',
      'StructureService'
    );
    await TestBed.configureTestingModule({
      imports: [EntriesModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(StructureCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('structure', data.structure);
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
