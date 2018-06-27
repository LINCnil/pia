import { browser, by, element } from 'protractor';

export class FolderCard {

  constructor(private element){
  
  }

  el(){
    return this.element;
  }

  openToolMenu() {
    return this.element.element(by.css('a.btn.pia-tooltip')).click();
  }

  clickOnDeleteInToolMenu(){
    return this.openToolMenu().then(() =>{
      return this.element.element(by.css('.pia-cardsBlock-toolbar-delete')).click();
    });
    
  }

}
