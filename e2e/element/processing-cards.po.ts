import { browser, by, element } from 'protractor';
import { ProcessingCard } from './processing-card.po';

export class ProcessingCards {

  container() {
    return element(by.css('.cardsContainer'));
  }

  byProcessingName(processingName: string): ProcessingCard {
    return new ProcessingCard(element(by.xpath('//app-card-item/div[contains(@data-name, "' + processingName + '")]')));
  }

}
