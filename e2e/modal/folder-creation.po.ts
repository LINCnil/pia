import { browser, by, element } from 'protractor';

export class FolderCreationModal {

  el() {
    return element(by.css('#modal-list-new-folder'));
  }

  fillFolderName(folderName: string) {
    return this.el().element(by.css('input#name')).sendKeys(folderName);
  }

  submitForm() {
      return this.el().element(by.css('button#pia-save-card-btn')).click();
  }

}
