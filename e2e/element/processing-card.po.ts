import { by } from 'protractor';

export class ProcessingCard {

  constructor(private element: any) {
  }

  el() {
    return this.element;
  }

  openToolMenu() {
    return this.element.element(by.css('a.btn.pia-tooltip')).click();
  }

  clickOnEdit() {
    return this.element.element(by.css('a.btn-edit')).click();
  }

  clickOnDeleteInToolMenu() {
    return this.openToolMenu().then(() => {
      return this.element.element(by.css('a.delete-processing')).click();
    });
  }

}
