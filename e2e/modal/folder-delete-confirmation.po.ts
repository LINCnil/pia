import { browser, by, element } from 'protractor';

export class FolderDeleteConfirmationModal {

  el() {
    return element(by.css('#modal-remove-folder'));
  }

  clickOnCancel() {
    return this.el().element(by.css('button.btn-cancel')).click();
  }

  confirmDeletion() {
      return this.el().element(by.css('button.btn-confirm')).click();
  }

}
