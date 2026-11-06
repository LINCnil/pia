import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsModule } from 'src/app/modules/settings/settings.module';
import { setComponentTestRoute } from 'src/app/testing/component-test-services';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();

    fixture = TestBed.createComponent(AboutComponent);
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
