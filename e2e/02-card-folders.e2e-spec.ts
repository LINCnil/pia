import { browser, by, element } from 'protractor';
import { LoginPage } from './page/login.po';
import { HomePage } from './page/home.po';
import { FolderCreationModal } from './modal/folder-creation.po';
import { FolderDeletionModal } from './modal/folder-deletion.po';
import { FolderCards } from './element/folder-cards.po';
import './set-env';


describe('PIA folder management', () => {

  const auth = {
    username: process.env.TEST_USERNAME,
    password: process.env.TEST_PASSWORD
  };
  const salt = Math.random().toString(36).substring(2, 8);
  const folderName = "Test Folder "+ salt;

  let loginPage: LoginPage;
  let homePage: HomePage;
  let folderCreationModal: FolderCreationModal;
  let folderDeletionModal: FolderDeletionModal;
  let folderCards: FolderCards;

  beforeEach(() => {
    loginPage = new LoginPage();
    homePage = new HomePage();
    folderCreationModal = new FolderCreationModal();
    folderDeletionModal = new FolderDeletionModal();
    folderCards = new FolderCards();

    loginPage.navigateTo();
    loginPage.clearSessionAndStorage();
    loginPage.fillCredentionals(auth.username, auth.password);
    loginPage.submitCredentials();

    browser.wait(function() {
      return browser.getCurrentUrl().then(function(url) {
        return /home/.test(url);
      });
    }, 10000);

  });

  afterEach(() => {
    loginPage = new LoginPage();
    homePage.clickOnLogoutInProfileMenu();
  });

  it('when user create a folder - a popup has to be filled and the created folder appear on the page', () => {

    homePage.clickOnCreateFolderInCreationMenu().then(() => {
        expect(folderCreationModal.el().isDisplayed()).toBeTruthy();
        
        folderCreationModal.fillFolderName(folderName);

        folderCreationModal.submitForm().then(() => {
          expect(folderCreationModal.el().isDisplayed()).toBeFalsy();
          expect(folderCards.byFolderName(folderName).el().isPresent()).toBeTruthy();
        });

    });

  });

  it('when user delete a folder - a popup ask for confirmation and the folder is deleted', () => {

    folderCards.byFolderName(folderName).clickOnDeleteInToolMenu().then(() => {
      expect(folderDeletionModal.el().isDisplayed()).toBeTruthy();
    });

    folderDeletionModal.confirmDeletion().then(() => {
      expect(folderDeletionModal.el().isDisplayed()).toBeFalsy();
      expect(folderCards.byFolderName(folderName).el().isPresent()).toBeFalsy();
    })

  });

});
