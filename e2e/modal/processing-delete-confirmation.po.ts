import { browser, by, element } from 'protractor';

export class ProcessingDeleteConfirmationModal {

  el() {
    return element(by.css('#modal-remove-processing'));
  }

  clickOnCancel() {
    return this.el().element(by.css('button.btn-cancel')).click();
  }

  confirmDeletion() {
    return this.el().element(by.css('button.btn-confirm')).click();
  }

}
