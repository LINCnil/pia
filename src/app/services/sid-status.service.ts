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
        if (sid === '4.3') {
          if (piaService.pia.dpos_names) {
            if (!piaService.pia.dpo_status || !piaService.pia.dpo_opinion) {
              this.itemStatus[sid] = 1;
            } else {
              this.itemStatus[sid] = 2;
            }
          }
          this.verification(piaService);
        } else {
          this.globalEvaluationService.isValidated(piaService.pia, sid, item).then((result: boolean) => {
            if (result) {
              this.itemStatus[sid] = 2;
              this.verification(piaService);
            } else {
              this.globalEvaluationService.isInEvaluation(piaService.pia, sid, item).then((result2: boolean) => {
                if (result2) {
                  this.itemStatus[sid] = 1;
                  this.verification(piaService);
                }
              });
            }
          });
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
          if (this.itemStatus[el] !== 2 && el !== '4.3') {
            valid = false;
          }
        }
      }
      this.enableDpoValidation = valid;
    });
  }
}
