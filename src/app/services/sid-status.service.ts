import { Injectable } from '@angular/core';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';

@Injectable()
export class SidStatusService {
  noIconFor: any;
  sidStatusIcon: any;
  defaultIcon = 'fa-pencil-square-o';
  globalEvaluationService: GlobalEvaluationService;

  constructor() {
    this.noIconFor = ['3.5', '4.1', '4.2'];
    this.sidStatusIcon = [];
    this.globalEvaluationService = new GlobalEvaluationService();
  }

  setSidStatus(piaService: any, section: any, item: any) {
    const sid = section.id + '.' + item.id;
    piaService.getPIA().then(() => {
      if (sid === '4.3') {
          if (piaService.pia.dpos_names) {
            if (!piaService.pia.dpo_status || !piaService.pia.dpo_opinion) {
              this.sidStatusIcon[sid] = 'fa-cog';
            } else {
              this.sidStatusIcon[sid] = 'fa-check-square-o';
            }
          }
      } else {
        this.globalEvaluationService.isValidated(piaService.pia, sid, item).then((result: boolean) => {
          if (result) {
            this.sidStatusIcon[sid] = 'fa-check-square-o';
          } else {
            this.globalEvaluationService.isInEvaluation(piaService.pia, sid, item).then((result2: boolean) => {
              if (result2) {
                this.sidStatusIcon[sid] = 'fa-cog';
              }
            });
          }
        });
      }
    });
  }
}
