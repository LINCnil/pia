import { browser } from 'protractor';
import { LoginPage } from './page/login.po';
import { Dashboard } from './page/dashboard.po';
import { Folders } from './page/folders.po';
import { FolderCreationModal } from './modal/folder-creation.po';
import { FolderDeleteConfirmationModal } from './modal/folder-delete-confirmation.po';
import { Header } from './element/header.po';
import { FolderCards } from './element/folder-cards.po';
import './set-env';


describe('Processing folder management', () => {

  const auth = {
    username: process.env.TEST_USERNAME,
    password: process.env.TEST_PASSWORD
  };
  const salt = Math.random().toString(36).substring(2, 8);
  const folderName = 'Test Folder ' + salt;

  const loginPage = new LoginPage();
  const dashboard = new Dashboard();
  const header = new Header();
  const folders = new Folders();
  const folderCreationModal = new FolderCreationModal();
  const folderDeleteConfirmationModal = new FolderDeleteConfirmationModal();
  const folderCards = new FolderCards();

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
    header.clickOnLogoutInProfileMenu();
  });

  it('when user creates a folder - a popup has to be filled and the created folder appears on the page', () => {

    folders.clickOnCreateFolderInCreationMenu().then(() => {
        expect(folderCreationModal.el().isDisplayed()).toBeTruthy();

        folderCreationModal.fillFolderName(folderName);

        folderCreationModal.submitForm().then(() => {
          expect(folderCreationModal.el().isDisplayed()).toBeFalsy();
          expect(folderCards.byFolderName(folderName).el().isPresent()).toBeTruthy();
        });

    });

  });

  it('when user deletes a folder - a popup asks for confirmation and the folder is deleted', () => {

    folderCards.byFolderName(folderName).clickOnDeleteInToolMenu().then(() => {
      expect(folderDeleteConfirmationModal.el().isDisplayed()).toBeTruthy();
    });

    folderDeleteConfirmationModal.confirmDeletion().then(() => {
      expect(folderDeleteConfirmationModal.el().isDisplayed()).toBeFalsy();
      expect(folderCards.byFolderName(folderName).el().isPresent()).toBeFalsy();
    });

  });

});
