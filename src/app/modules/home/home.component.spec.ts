import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HomeModule } from 'src/app/modules/home/home.module';
import {
  ComponentTestData,
  createComponentTestData,
} from 'src/app/testing/component-test-data';
import {
  mockComponentServices,
  setComponentTestRoute,
} from 'src/app/testing/component-test-services';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let data: ComponentTestData;
  let fullScreenAlert: HTMLDivElement;

  beforeEach(async () => {
    data = createComponentTestData();
    mockComponentServices(
      data,
      'AuthService',
      'DialogService',
      'LanguagesService'
    );
    await TestBed.configureTestingModule({
      imports: [HomeModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    setComponentTestRoute();
    fullScreenAlert = document.createElement('div');
    fullScreenAlert.className = 'pia-closeFullScreenModeAlertBlock';
    document.body.appendChild(fullScreenAlert);

    fixture = TestBed.createComponent(HomeComponent);
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
