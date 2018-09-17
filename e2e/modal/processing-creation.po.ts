import { browser, by, element } from 'protractor';

export class ProcessingCreationModal {

  el() {
    return element(by.css('div#modal-list-new-processing'));
  }

  fillProcessingName(processingName: string) {
    return this.el().element(by.css('input#name')).sendKeys(processingName);
  }

  fillProcessingAuthor(processingAuthor: string) {
    return this.el().element(by.css('input#author')).sendKeys(processingAuthor);
  }

  fillProcessingDesignatedController(processingDesignatedController: string) {
    return this.el().element(by.css('input#designated-controller')).sendKeys(processingDesignatedController);
  }

  submitForm() {
      return this.el().element(by.css('button#processing-save-card-btn')).click();
  }

}
