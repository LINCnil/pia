import { browser, by, element, protractor } from 'protractor';

export class Header {

  el() {
    return element(by.css('header.pia-headerBlock'));
  }

  navbarProfile() {
    return element(by.css('li.pia-navigationBlock-profile > a > span'));
  }

  async openProfileMenu() {
    const menu = element(by.css('li.pia-navigationBlock-profile > a'));

    browser.wait(protractor.ExpectedConditions.presenceOf(menu), 5000);
    browser.wait(protractor.ExpectedConditions.visibilityOf(menu), 5000);

    browser.executeScript('arguments[0].scrollIntoView()', menu);
    browser.actions().mouseMove(menu).perform();

    return menu.click();
  }

  async clickOnLogoutInProfileMenu() {
    await this.openProfileMenu();

    const button = element(by.css('#user-block li.logout > a'))

    browser.wait(protractor.ExpectedConditions.presenceOf(button), 5000);
    browser.wait(protractor.ExpectedConditions.visibilityOf(button), 5000);

    return button.click();
  }
}
