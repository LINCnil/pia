import { browser, protractor } from 'protractor';
import { LoginPage } from './page/login.po';
import { Dashboard } from './page/dashboard.po';
import { Folders } from './page/folders.po';
import { ProcessingForm } from './page/processing-form.po';
import { ProcessingCreationModal } from './modal/processing-creation.po';
import { ProcessingDeleteConfirmationModal } from './modal/processing-delete-confirmation.po';
import { Header } from './element/header.po';
import { ProcessingCards } from './element/processing-cards.po';
import './set-env';
import { doesNotThrow } from 'assert';


describe('Processing management', () => {

  const auth = {
    username: process.env.TEST_USERNAME,
    password: process.env.TEST_PASSWORD
  };
  const salt = Math.random().toString(36).substring(2, 8);
  const processingName = 'Test processing ' + salt;
  const processingAuthor = 'author ' + salt;
  const processingDesignatedController = 'controller ' + salt;
  const testData = {
    'processing-description': 'desc' + salt,
    'processing-controllers': 'cont' + salt,
    'processing-lawfulness': 'law' + salt,
    'processing-standards': 'stan' + salt,
    'processing-consent': 'con' + salt,
    'processing-rights-guarantee': 'rig' + salt,
    'processing-data-types': {
      'personal' : {
        retention: 'ret' + salt,
        sensitive: true
      }
    }
    ,
    'processing-exactness': 'exa' + salt,
    'processing-minimization': 'min' + salt,
    'processing-storage': 'sto' + salt,
    'processing-lifecycle': 'life' + salt,
    'processing-processors': 'proc' + salt,
    'processing-non-eu-transfer': 'non' + salt
  };

  const loginPage = new LoginPage();
  const dashboard = new Dashboard();
  const header = new Header();
  const folders = new Folders();
  const processingForm = new ProcessingForm();
  const processingCreationModal = new ProcessingCreationModal();
  const processingDeleteConfirmationModal = new ProcessingDeleteConfirmationModal();
  const processingCards = new ProcessingCards();

  beforeEach(() => {
    loginPage.authenticate(auth.username, auth.password);

    browser.wait(function() {
      return browser.getCurrentUrl().then(function(url) {
        return /dashboard/.test(url);
      });
    }, 10000);

    dashboard.clickOnDashboardItem('processings');

    browser.wait(function() {
      return browser.getCurrentUrl().then(function(url) {
        return /folders/.test(url);
      });
    }, 10000);

  });

  afterEach(() => {
      const menu = header.el();

      browser.wait(protractor.ExpectedConditions.presenceOf(menu), 5000);
      browser.wait(protractor.ExpectedConditions.visibilityOf(menu), 5000);
      browser.executeScript('arguments[0].scrollIntoView()', menu);
      header.clickOnLogoutInProfileMenu();
  });

  it('when user creates a processing - a popup has to be filled and the created processing appears on the page', () => {
    folders.clickOnCreateProcessingInCreationMenu().then(() => {
      expect(processingCreationModal.el().isDisplayed()).toBeTruthy();

      processingCreationModal.fillProcessingName(processingName);
      processingCreationModal.fillProcessingAuthor(processingAuthor);
      processingCreationModal.fillProcessingDesignatedController(processingDesignatedController);

      processingCreationModal.submitForm().then(() => {
        browser.wait(function() {
          return browser.getCurrentUrl().then(function(url) {
            return /processing/.test(url);
          });
        }, 10000);

        processingForm.clickOnReturn();

        browser.wait(function() {
          return browser.getCurrentUrl().then(function(url) {
            return /folders/.test(url);
          });
        }, 10000);

        expect(processingCreationModal.el().isDisplayed()).toBeFalsy();
        expect(processingCards.byProcessingName(processingName).el().isPresent()).toBeTruthy();
      });

    });

  });

  it('when user edits a processing the value is updated', done => {
    const card = processingCards.byProcessingName(processingName);

    card.clickOnEdit().then(() => {
      processingForm.fill(testData).then(function() {
        processingForm.getValue().then(value => {
          expect(Object.keys(value).length > 0).toBeTruthy();

          // tslint:disable-next-line:forin
          for (const field in value) {
            if (field === 'processing-data-types') {
              const types = value[field];
              // tslint:disable-next-line:forin
              for (const key in types) {
                const type = types[key];
                // tslint:disable-next-line:forin
                for (const index in type) {
                  expect(type[index].toString() === testData[field][key][index].toString()).toBeTruthy();
                }
              }
            }

            expect(value[field].toString() === testData[field].toString()).toBeTruthy();
          }

          done();
        });
      });
    });
  });

  it('when user deletes a processing - a popup asks for confirmation and the processing is deleted', () => {
    const card = processingCards.byProcessingName(processingName);

    card.clickOnDeleteInToolMenu().then(() => {
      expect(processingDeleteConfirmationModal.el().isDisplayed()).toBeTruthy();

      processingDeleteConfirmationModal.confirmDeletion().then(() => {
        expect(processingDeleteConfirmationModal.el().isDisplayed()).toBeFalsy();
        expect(processingCards.byProcessingName(processingName).el().isPresent()).toBeFalsy();
      })
    });
  });

});
