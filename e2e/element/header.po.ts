import { browser, by, element } from 'protractor';

export class Header {

  el() {
    return element(by.css('header.pia-headerBlock'));
  }

  navbarProfile() {
    return element(by.css('li.pia-navigationBlock-profile > a > span'));
  }
  openProfileMenu() {
    return element(by.css('li.pia-navigationBlock-profile > a')).click();
  }

  clickOnLogoutInProfileMenu() {
    return this.openProfileMenu().then(() => {
      return element(by.css('#user-block li.logout > a')).click();
    });
  }

}
