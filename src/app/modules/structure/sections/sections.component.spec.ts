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
import { SectionsComponent } from './sections.component';

describe('SectionsComponent', () => {
  let component: SectionsComponent;
  let fixture: ComponentFixture<SectionsComponent>;
  let data: ComponentTestData;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(data, 'SidStatusService', 'StructureService');
    await TestBed.configureTestingModule({
      imports: [
        StructureModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(SectionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('structure', data.structure);
    fixture.componentRef.setInput('section', data.section);
    fixture.componentRef.setInput('item', data.item);
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
