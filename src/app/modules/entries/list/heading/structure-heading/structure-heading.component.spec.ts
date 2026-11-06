import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EntriesModule } from 'src/app/modules/entries/entries.module';
import { setComponentTestRoute } from 'src/app/testing/component-test-services';
import { StructureHeadingComponent } from './structure-heading.component';

describe('StructureHeadingComponent', () => {
  let component: StructureHeadingComponent;
  let fixture: ComponentFixture<StructureHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntriesModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(StructureHeadingComponent);
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
