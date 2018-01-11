import { Injectable } from '@angular/core';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

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
  globalEvaluationService: GlobalEvaluationService;

  constructor() {
    this.noIconFor = ['3.5', '4.1', '4.2', '4.4', '4.5'];
    this.specialIcon = { '3.5': 'fa-line-chart', '4.1': 'fa-line-chart', '4.2': 'fa-calendar-check-o' }
    this.sidStatusIcon = { 0: 'fa-pencil-square-o', 1: 'fa-cog', 2: 'fa-check-square-o' };
    this.itemStatus = {}; // 0: Null, 1: In evaluation, 2: Validated
    this.globalEvaluationService = new GlobalEvaluationService();
  }

  setSidStatus(piaService: any, section: any, item: any) {
    const sid = section.id + '.' + item.id;
    if (!this.noIconFor.includes(sid)) {
      this.itemStatus[sid] = 0;
      piaService.getPIA().then(() => {
        // Special behaviour for DPO page
        if (sid === '4.3') {
          let dpoFilled = false;
          let concernedPeopleOpinionSearchedFieldsFilled = false;
          let concernedPeopleOpinionUnsearchedFieldsFilled = false;

          // Edition enabled
          this.itemStatus[sid] = 1;

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
            this.itemStatus[sid] = 2;
          }
          this.verification(piaService);
        } else {
          this.globalEvaluationService.isValidated(piaService.pia, sid, item).then((result: boolean) => {
            if (result) {
              this.itemStatus[sid] = 2;
            } else {
              this.globalEvaluationService.isInEvaluation(piaService.pia, sid, item).then((result2: boolean) => {
                if (result2) {
                  this.itemStatus[sid] = 1;
                }
              });
            }
            this.verification(piaService);
          });
        }
      });
    }
  }

  removeSidStatus(piaService: any, section: any, item: any) {
    const sid = section.id + '.' + item.id;
    if (!this.noIconFor.includes(sid)) {
      this.itemStatus[sid] = 0;
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

  verification(piaService: any) {
    this.enablePiaValidation = false;
    this.piaIsRefused = false;

    piaService.getPIA().then(() => {
      let valid = true;
      for (const el in this.itemStatus) {
        if (this.itemStatus.hasOwnProperty(el)) {
          if (this.itemStatus[el] !== 2) {
            valid = false;
          }
        }
      }
      if (valid) {
        this.enablePiaValidation = [0, 2, 3].includes(piaService.pia.status);
        this.piaIsRefused = [1, 4].includes(piaService.pia.status);
      }
    });
  }

  verificationForDpo(piaService: any) {
    piaService.getPIA().then(() => {
      let valid = true;
      for (const el in this.itemStatus) {
        if (this.itemStatus.hasOwnProperty(el)) {
          // If one subsection (different from DPO page) is in edition, it's false
          if (this.itemStatus[el] !== 2 && el !== '4.3') {
            valid = false;
          }
        }
      }
      this.enableDpoValidation = valid;
    });
  }

  refusePia(piaService: any) {
    for (const el in this.itemStatus) {
      if (this.itemStatus.hasOwnProperty(el)) {
        this.itemStatus[el] = 1;
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
  }
}
