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
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let data: ComponentTestData;
  let fullScreenAlert: HTMLDivElement;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'AppDataService',
      'AuthService',
      'IntrojsService',
      'LanguagesService'
    );
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();
    fullScreenAlert = document.createElement('div');
    fullScreenAlert.className = 'pia-closeFullScreenModeAlertBlock';
    document.body.appendChild(fullScreenAlert);

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    fullScreenAlert.remove();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
