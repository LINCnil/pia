import { by, element, protractor, browser } from 'protractor';

export class ProcessingDataTypes {

  // tslint:disable-next-line:no-shadowed-variable
  constructor(private element: any)  {}

  container() {
    return element(by.css('div.processing-data-types'));
  }

  el() {
    return this.element;
  }

  async fill(value: any) {
    // tslint:disable-next-line:forin
    for (const type in value) {
      const data = value[type];
      const enabledInput = element(by.css('#' + type + '-data .type-enabled input'));
      const retentionInput = element(by.css('#' + type + '-data input.retention-period'));

      this.waitForElement(enabledInput);

      // Enabled
      await enabledInput.click();

      this.waitForElement(retentionInput);
      // Retention period
      await retentionInput.sendKeys(data.retention);
      // Is sensitive
      if (data.sensitive) {
        await element(by.css('#' + type + '-data .type-sensitive input')).click();
      }
    }
  }

  async getValue() {
    const value = {};
    const types = element.all(by.css('div.processing-data-type'));

    await types.each(async elem => {
      this.waitForElement(elem);

      const id = await elem.getAttribute('id');
      const type = id.replace('-data', '');
      const enabledInput = element(by.css('#' + id + ' .type-enabled input'));

      // this.waitForElement(enabledInput);

      const enabled = await enabledInput.isSelected();

      if (enabled) {
        value[type] = {};
        value[type]['retention'] = await element(by.css('#' + id + ' input.retention-period')).getAttribute('value');
        value[type]['sensitive'] = await element(by.css('#' + id + ' .type-sensitive input')).isSelected();
      }
    });

    return value;
  }

  waitForElement(elem: any) {
    // Wait for element to be in the DOM and visible
    browser.wait(protractor.ExpectedConditions.presenceOf(elem), 5000);
    browser.wait(protractor.ExpectedConditions.visibilityOf(elem), 5000);

    // Scroll to element
    browser.actions().mouseMove(elem).perform();
    browser.executeScript('arguments[0].scrollIntoView()', elem);
  }

}
