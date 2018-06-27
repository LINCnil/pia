import { browser, by, element } from 'protractor';
import { FolderCard } from './folder-card.po';

export class FolderCards {

  container() {
    return element(by.css('.cardsContainer'));
  }

  byFolderName(folderName: string): FolderCard {
    return new FolderCard(element(by.xpath('//app-folder-item/div[contains(@data-name, "' + folderName + '")]')));
  }

}
