import { browser, by, element } from 'protractor';

export class Dashboard {

  navigateTo() {
    return browser.get('/dashboard');
  }

  clickOnDashboardItem(itemName) {
    return element(by.css('div.dashboard-item.' + itemName)).click();
  }
}
