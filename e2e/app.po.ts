import { browser, by, element } from 'protractor';

export class PiaPage {
  navigateTo() {
    return browser.get('/');
  }

  getButtonText() {
    return element(by.css('.pia-authenticationBlock-enter a')).getText();
  }
}
