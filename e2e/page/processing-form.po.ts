import { browser, by, element, protractor } from 'protractor';
import { ProcessingDataTypes } from './../form/processing-data-types.po';

export class ProcessingForm {

  private fields = [
    'processing-description',
    'processing-controllers',
    'processing-lawfulness',
    'processing-standards',
    'processing-consent',
    'processing-rights-guarantee',
    'processing-data-types',
    'processing-exactness',
    'processing-minimization',
    'processing-storage',
    'processing-lifecycle',
    'processing-processors',
    'processing-non-eu-transfer'
  ];

  private processingDataTypes = new ProcessingDataTypes(element(by.css('#processing-data-types')));

  navigateTo(processingId: any) {
    return browser.get('/#/processing/' + processingId);
  }

  clickOnReturn() {
    return  element(by.css('a.pia-icon-close-big')).click();
  }

  async fill(data: any) {
    // tslint:disable-next-line:forin
    for (const key in data) {
      await this.fillField(key, data[key]);
    }
  }

  async fillField(fieldId: string, value: any) {
    if (fieldId === 'processing-data-types') {
      await this.dataSection();

      await this.processingDataTypes.fill(value);

      return;
    }

    if (fieldId === 'processing-lifecycle') {
      await this.lifecycleSection();
    }

    const field = element(by.css('#' + fieldId));

    this.waitForElement(field);

    await field.click();

    // fill tinymce editor
    browser.executeScript('tinyMCE.activeEditor.setContent("' + value + '")');
    // focus out to close editor
    await this.focusOut();
  }

  async getValue() {
    const values = {};

    await this.descriptionSection();

    // tslint:disable-next-line:forin
    for (const key in this.fields) {
      const fieldId = this.fields[key];

      if (fieldId === 'processing-data-types') {
        await this.dataSection();
        values[fieldId] = await this.processingDataTypes.getValue();

        continue;
      }

      if (fieldId === 'processing-lifecycle') {
        await this.lifecycleSection();
      }

      const field = element(by.id(fieldId));

      values[fieldId] = await field.getAttribute('value');
    }

    return values;
  }

  focusOut() {
    const field = element(by.css('div.processing-entryContentBlock-header-title'));

    this.waitForElement(field);

    return field.click();
  }

  descriptionSection() {
    const field = element(by.css('div.description-section'));

    this.waitForElement(field);

    return field.click();
  }

  dataSection() {
    const field = element(by.css('div.data-section'));

    this.waitForElement(field);

    return field.click();
  }

  lifecycleSection() {
    const field = element(by.css('div.lifecycle-section'));

    this.waitForElement(field);

    return field.click();
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
