import { Injectable } from '@angular/core';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SidStatusService {
  noIconFor: any;
  specialIcon: any;
  sidStatusIcon: any;
  itemStatus: any;
  defaultIcon = 'fa-pencil-square-o';
  enablePiaValidation = false;
  piaIsRefused = false;
  enableDpoValidation = false;
  public subject = new Subject();

  constructor(private _globalEvaluationService: GlobalEvaluationService) {
    this.specialIcon = { '3.5': 'fa-line-chart', '4.1': 'fa-line-chart', '4.2': 'fa-calendar-check-o' }
    this.sidStatusIcon = {
      0: 'fa-pencil-square-o',
      1: 'fa-pencil-square-o',
      2: ['fa-pencil-square-o', 'pia-fa-valid'],
      3: 'fa-pencil-square-o',
      4: 'fa-cog',
      5: 'fa-cog',
      6: 'fa-cog',
      7: ['fa-cog', 'pia-fa-valid'],
      8: 'fa-check-square-o'
    };
    this.itemStatus = {};
    this._globalEvaluationService.behaviorSubject.subscribe((obj: { reference_to: string, status: number }) => {
      this.itemStatus[obj.reference_to] = obj.status;
    });
  }

  setSidStatus(piaService: any, section: any, item: any) {
    const reference_to = section.id + '.' + item.id;
    // We need to instanciate a new instance of GLobalEvaluationService
    const globalEvaluationService = new GlobalEvaluationService();
    globalEvaluationService.pia = piaService.pia;
    globalEvaluationService.section = section;
    globalEvaluationService.item = item;
    if (item.evaluation_mode === 'item' || item.evaluation_mode === 'question') {
      globalEvaluationService.validate(false).then((obj: { reference_to: string, status: number }) => {
        this.itemStatus[obj.reference_to] = obj.status;
      });
    } else if (reference_to === '4.3') {
      this.dpoVerification(piaService, reference_to);
    }
    this.verificationForDpo(piaService);
    this.enablePiaValidation = [0, 2, 3].includes(piaService.pia.status);
    this.piaIsRefused = [1, 4].includes(piaService.pia.status);
  }

  private dpoVerification(piaService: any, reference_to: string) {
    let dpoFilled = false;
    let concernedPeopleOpinionSearchedFieldsFilled = false;
    let concernedPeopleOpinionUnsearchedFieldsFilled = false;

    // Edition enabled
    this.itemStatus[reference_to] = 0;

    // All DPO fields filled = OK
    if (piaService.pia.dpos_names
      && piaService.pia.dpos_names.length > 0
      && (piaService.pia.dpo_status === 0 || piaService.pia.dpo_status === 1)
      && piaService.pia.dpo_opinion
      && piaService.pia.dpo_opinion.length > 0) {
        dpoFilled = true;
    }

    // Concerned people opinion unsearched + no search reason field filled = OK
    if (piaService.pia.concerned_people_searched_opinion === false) {
      if (piaService.pia.concerned_people_searched_content
          && piaService.pia.concerned_people_searched_content.length > 0) {
            concernedPeopleOpinionUnsearchedFieldsFilled = true;
      }
    }

    // Concerned people opinion searched + name(s) + status + opinions = OK :
    if (piaService.pia.concerned_people_searched_opinion === true) {
      if (piaService.pia.people_names
          && piaService.pia.people_names.length > 0
          && (piaService.pia.concerned_people_status === 0 || piaService.pia.concerned_people_status === 1)
          && piaService.pia.concerned_people_opinion
          && piaService.pia.concerned_people_opinion.length > 0) {
            concernedPeopleOpinionSearchedFieldsFilled = true;
      }
    }

    // Treatment which validates the subsection if everything is OK
    // DPO filled + unsearched opinion scenario filled OR DPO filled + searched opinion scenario filled
    if ((dpoFilled === true && concernedPeopleOpinionUnsearchedFieldsFilled === true)
        || (dpoFilled === true && concernedPeopleOpinionSearchedFieldsFilled === true)) {
      this.itemStatus[reference_to] = 7;
      if (piaService.pia.status > 1) {
        this.itemStatus[reference_to] = 8;
      }
    } else {
      this.enablePiaValidation = false;
    }
  }

  removeSidStatus(piaService: any, section: any, item: any) {
    const sid = section.id + '.' + item.id;
    if (!this.noIconFor.includes(sid)) {
      this.itemStatus[sid] = 0;
      // TODO the code below isn't useful
      piaService.getPIA().then(() => {
        // Special behaviour for DPO page
        if (sid === '4.3') {
          // Nothing to do
        } else {
          this.itemStatus[sid] = 0;
        }
      });
    }
  }

  // verification(piaService: any) {
  //   this.enablePiaValidation = false;
  //   this.piaIsRefused = false;

  //   piaService.getPIA().then(() => {
  //     let valid = true;
  //     for (const el in this.itemStatus) {
  //       if (this.itemStatus.hasOwnProperty(el)) {
  //         if (this.itemStatus[el] < 3) {
  //           valid = false;
  //         }
  //       }
  //     }
  //     if (valid) {
  //       this.enablePiaValidation = [0, 2, 3].includes(piaService.pia.status);
  //       this.piaIsRefused = [1, 4].includes(piaService.pia.status);
  //     }
  //     this.verificationForDpo(piaService);
  //   });
  // }

  verificationForDpo(piaService: any) {
    piaService.getPIA().then(() => {
      let valid = true;
      for (const el in this.itemStatus) {
        if (this.itemStatus.hasOwnProperty(el)) {
          if (this.itemStatus[el] < 7 && el !== '4.3') {
            valid = false;
          }
        }
      }
      this.enableDpoValidation = valid;
    });
  }

  refusePia(piaService: any) {
    this.enablePiaValidation = false;
    for (const el in this.itemStatus) {
      if (this.itemStatus.hasOwnProperty(el)) {
        this.itemStatus[el] = 6;
      }
    }
    this.resetDpoPage(piaService);
  }

  private resetDpoPage(piaService: any) {
    piaService.pia.dpos_names = null;
    piaService.pia.dpo_status = null;
    piaService.pia.dpo_opinion = null;
    piaService.pia.concerned_people_searched_opinion = null;
    piaService.pia.concerned_people_searched_content = null;
    piaService.pia.people_names = null;
    piaService.pia.concerned_people_status = null;
    piaService.pia.concerned_people_opinion = null;
    piaService.pia.update();
    this.enableDpoValidation = false;
  }
}
