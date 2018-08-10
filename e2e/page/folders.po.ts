import { browser, by, element } from 'protractor';

export class Folders {

  navigateTo() {
    return browser.get('/#/folders');
  }

  openCreationMenu() {
    return element(by.css('.menu-creation button.pia-filtersBlock-filters-btn.btn')).click();
  }

  clickOnCreateFolderInCreationMenu() {
    return this.openCreationMenu().then(() => {
      return element(by.css('.menu-creation button[name="create-folder-btn"]')).click();
    });
  }

  clickOnCreateProcessingInCreationMenu() {
    return this.openCreationMenu().then(() => {
      return element(by.css('.menu-creation button[name="create-processing-btn"]')).click();
    });
  }
}
