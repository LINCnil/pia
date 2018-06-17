import { browser, by, element } from 'protractor';

export class HomePage {
  navigateTo() {
    return browser.get('/home');
  }

  navbarProfile() {
    return element(by.css('li.pia-navigationBlock-profile a span'));
  }
}
