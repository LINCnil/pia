import { Injectable } from "@angular/core";

import { Pia } from "src/app/entry/pia.model";
import { Answer } from "src/app/entry/entry-content/questions/answer.model";
import { Measure } from "src/app/entry/entry-content/measures/measure.model";

import { ModalsService } from "src/app/modals/modals.service";
import { AppDataService } from "src/app/services/app-data.service";

@Injectable()
export class ArchiveService {
  archivedPias = [];
  data: { sections: any };

  constructor(
    private _modalsService: ModalsService,
    public _appDataService: AppDataService
  ) {
    this.data = this._appDataService.dataNav;
  }

  /**
   * Sends back an archived PIA to an active PIA
   */
  unarchivePia() {
    const id = parseInt(localStorage.getItem("pia-to-unarchive-id"), 10);

    // Update the PIA in DB.
    const pia = new Pia();
    pia.get(id).then(() => {
      pia.is_archive = 0;
      pia.update();
    });

    // Deletes the PIA from the view
    if (
      localStorage.getItem("homepageDisplayMode") &&
      localStorage.getItem("homepageDisplayMode") === "list"
    ) {
      document.querySelector('.app-list-item[data-id="' + id + '"]').remove();
    } else {
      document
        .querySelector('.pia-cardsBlock.pia[data-id="' + id + '"]')
        .remove();
    }

    localStorage.removeItem("pia-to-unarchive-id");
    this._modalsService.closeModal();
  }

  /**
   * Allows an user to definitely remove an archived PIA
   */
  removeArchivedPia() {
    const id = parseInt(localStorage.getItem("pia-to-remove-id"), 10);

    // Removes from DB
    const archivedPia = new Pia();
    archivedPia.delete(id);

    // Deletes the PIA from the view
    if (
      localStorage.getItem("homepageDisplayMode") &&
      localStorage.getItem("homepageDisplayMode") === "list"
    ) {
      document.querySelector('.app-list-item[data-id="' + id + '"]').remove();
    } else {
      document
        .querySelector('.pia-cardsBlock.pia[data-id="' + id + '"]')
        .remove();
    }

    localStorage.removeItem("pia-to-remove-id");
    this._modalsService.closeModal();
  }

  async calculProgress() {
    this.archivedPias.forEach((archivedPia: Pia) => {
      this.calculPiaProgress(archivedPia);
    });
  }

  calculPiaProgress(pia: Pia) {
    let numberElementsToValidate = 1;
    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        if (item.questions) {
          numberElementsToValidate += item.questions.length;
        }
      });
    });
    const answer = new Answer();
    let numberElementsValidated = 0;
    answer.findAllByPia(pia.id).then((answers: any) => {
      numberElementsValidated += answers.length;
      if (pia.status > 1) {
        numberElementsValidated += 1;
      }
      const measure = new Measure();
      measure.pia_id = pia.id;
      measure.findAll().then((measures: any) => {
        numberElementsToValidate += measures.length;
        numberElementsValidated += measures.length;
        pia.progress = Math.round(
          (100 / numberElementsToValidate) * numberElementsValidated
        );
      });
    });
  }
}
