import { browser, by, element } from 'protractor';

export class HomePage {

  navigateTo() {
    return browser.get('/home');
  }

  navbarProfile() {
    return element(by.css('li.pia-navigationBlock-profile > a > span'));
  }
  openProfileMenu() {
    return element(by.css('li.pia-navigationBlock-profile > a')).click();
  }

  openCreationMenu() {
    return element(by.css('.menu-creation button.pia-filtersBlock-filters-btn.btn')).click();
  }

  clickOnCreateFolderInCreationMenu() {
    return this.openCreationMenu().then(() => {
      return element(by.css('.menu-creation button[name="create-folder-btn"]')).click();
    });
  }

  clickOnLogoutInProfileMenu() {
    return this.openProfileMenu().then(() => {
      return element(by.css('#user-block li.logout > a')).click();
    });
  }
}
