import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { GlobalEvaluationService } from './global-evaluation.service';
import { IntrojsService } from '../services/introjs.service';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class SidStatusService {
  noIconFor: any;
  specialIcon: any;
  sidStatusIcon: any;
  itemStatus: any;
  structureStatus: any;
  defaultIcon = 'fa-pencil-square-o';
  enablePiaValidation: boolean;
  piaIsRefused: boolean;
  enableDpoValidation: boolean;
  public subject = new Subject();

  constructor(
    private introjsService: IntrojsService,
    private globalEvaluationService: GlobalEvaluationService,
    private route: ActivatedRoute
  ) {
    this.specialIcon = {
      '3.5': 'fa-line-chart',
      '4.1': 'fa-line-chart',
      '4.2': 'fa-calendar-check-o'
    };
    this.sidStatusIcon = {
      0: 'fa-pencil-square-o',
      1: 'fa-pencil-square-o',
      2: 'fa-pencil-square-o',
      3: 'fa-pencil-square-o',
      4: ['fa-pencil-square-o', 'pia-fa-valid'],
      5: 'fa-cog',
      6: 'fa-cog',
      7: ['fa-cog', 'pia-fa-valid'],
      8: 'fa-check-square-o'
    };
    this.itemStatus = {};
    this.structureStatus = {};
    this.enablePiaValidation = false;
    this.piaIsRefused = false;
    this.enableDpoValidation = false;
    this.globalEvaluationService.behaviorSubject.subscribe((obj: { reference_to: string; status: number }) => {
      if (obj.reference_to && obj.status > 0) {
        this.itemStatus[obj.reference_to] = obj.status;
        this.verifEnableDpo();
      }

      if (localStorage.getItem('onboardingEntryConfirmed')) {
        this.introjsService.start('evaluation');
      }

    });
  }

  /**
   * Set status by reference.
   * @param pia - The PIA.
   * @param section - The section.
   * @param item - The item.
   */
  setSidStatus(pia: any, section: any, item: any): void {
    const referenceTo = section.id + '.' + item.id;
    // We need to instanciate a new instance of GLobalEvaluationService
    const globalEvaluationService = new GlobalEvaluationService();
    globalEvaluationService.pia = pia;
    globalEvaluationService.section = section;
    globalEvaluationService.item = item;
    if (item.evaluation_mode === 'item' || item.evaluation_mode === 'question' || referenceTo === '4.3') {
      globalEvaluationService.validate(false).then((obj: { reference_to: string; status: number }) => {
        if (referenceTo === '4.3') {
          this.enablePiaValidation = globalEvaluationService.enablePiaValidation;
          this.piaIsRefused = globalEvaluationService.piaIsRefused;
        }
        this.itemStatus[obj.reference_to] = obj.status;
        this.verifEnableDpo();
        this.setPiaProgress(pia, referenceTo, obj.status);
      });
    }
  }

  setPiaProgress(pia: any, referenceTo: string, status: number): void {
    let percent = 0;
    let basePoint = 3.75;

    if (referenceTo === '4.3') {
      basePoint = 2;
    }
    if (status >= 1 && status < 5) {
      percent = basePoint;
    } else if (status === 5 || status === 6) {
      percent = basePoint * 2;
    } else if (status >= 7) {
      percent = basePoint * 3;
    }
    pia.progress += percent;
  }

  /**
   * Set status structure
   * @param section - The section.
   * @param item - The item.
   */
  setStructureStatus(section: any, item: any): void {
    let contentExist = false;
    if (item.is_measure) {
      if (item.answers) {
        contentExist = item.answers.map(x => x.title).filter(String).length > 0;
      }
    } else if (item.questions) {
      item.questions.forEach(question => {
        if (!contentExist && question.answer) {
          contentExist = question.answer.length > 0;
        }
      });
    }
    this.structureStatus[`${section.id}.${item.id}`] = contentExist;
  }

  /**
   * Reset all statuses.
   * @param section - The section.
   * @param item - The item.
   */
  removeSidStatus(section: any, item: any): void {
    const sid = section.id + '.' + item.id;
    if (!this.noIconFor.includes(sid)) {
      this.itemStatus[sid] = 0;
      if (sid === '4.3') {
        // Nothing to do
      } else {
        this.itemStatus[sid] = 0;
      }
    }
  }

  /**
   * Update PIA status to refused.
   * @param piaId - The PIA Service.
   */
  async refusePia(piaId: number): Promise<void> {
    this.enablePiaValidation = false;
    return new Promise((resolve, reject) => {
      for (const el in this.itemStatus) {
        if (this.itemStatus.hasOwnProperty(el)) {
          this.itemStatus[el] = 6;
        }
      }
      this.enableDpoValidation = false;
      resolve();
    });
  }

  /**
   * Verification to enable the DPD page fields.
   */
  verifEnableDpo(): void {
    this.enableDpoValidation = false;
    let count = 0;
    for (const el in this.itemStatus) {
      if (this.itemStatus.hasOwnProperty(el) && this.itemStatus[el] >= 7 && el !== '4.3') {
        count++;
      }
    }
    if (count === Object.keys(this.itemStatus).length - 1) {
      this.enableDpoValidation = true;
    }
  }

  /**
   * Verification to enable Action Plan page.
   */
  verifEnableActionPlan(): boolean {
    let valid = false;
    for (const el in this.itemStatus) {
      if (this.itemStatus.hasOwnProperty(el) && this.itemStatus[el] >= 5) {
        valid = true;
      }
    }
    return valid;
  }
}
