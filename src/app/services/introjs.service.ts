import { Injectable, OnChanges } from '@angular/core';

import { Router } from '@angular/router';
import * as introJs from 'intro.js/intro.js';

import { TranslateService } from '@ngx-translate/core';
import { SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class IntrojsService {
  public sectionsLoaded: Boolean = null;
  sectionsChange: Subject<any> = new Subject<any>();
  public evaluationsLoaded: Boolean = null;
  evaluationsChange: Subject<any> = new Subject<any>();

  public entrySideView = 'knowledge';
  entrySideViewChange: Subject<any> = new Subject<any>();

  constructor(private router: Router, private _translateService: TranslateService) {
    console.log('Introjs connected');

    this.sectionsChange.subscribe(bool => {
      console.log('changements sections', bool);
      this.sectionsLoaded = bool;
      this.autoSelectOnBoarding();
    });
    this.evaluationsChange.subscribe(bool => {
      console.log('changements evaluations', bool);
      this.evaluationsLoaded = bool;
      this.autoSelectOnBoarding();
    });
  }

  sections(bool) {
    this.sectionsChange.next(bool);
  }

  evaluations(bool) {
    this.evaluationsChange.next(bool);
  }

  public autoSelectOnBoarding() {
    if (this.sectionsLoaded !== null && this.evaluationsLoaded !== null) {
      console.log('INTRO JS ACTIVATED');
      if (this.evaluationsLoaded === true) {
        this.start('evaluation');
      } else {
        this.start('entry');
      }
    }
  }

  private prepareEntryOnBoarding() {
    var i = 0;
    const INTROJS = introJs();
    INTROJS.addStep({
      tooltipclass: 'pia-onboarding-entry-step-1',
      element: document.querySelectorAll('.pia-sectionsBlock')[0],
      intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.entry.step1.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.entry.step1.description')}
          </div>
          <div class='pia-onboarding-steps'>1/7</div>
        `,
      position: 'right'
    })
      .addStep({
        tooltipclass: 'pia-onboarding-entry-step-2',
        element: document.querySelectorAll('.sections-1-title')[0],
        intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.entry.step2.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.entry.step2.description')}
          </div>
          <div class='pia-onboarding-steps'>2/7</div>
        `,
        position: 'right'
      })
      .addStep({
        tooltipclass: 'pia-onboarding-entry-step-3',
        element: document.querySelectorAll('.sections-2-title')[0],
        intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.entry.step3.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.entry.step3.description')}
          </div>
          <div class='pia-onboarding-steps'>3/7</div>
        `,
        position: 'right'
      })
      .addStep({
        tooltipclass: 'pia-onboarding-entry-step-4',
        element: document.querySelectorAll('.sections-3-title')[0],
        intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.entry.step4.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.entry.step4.description')}
          </div>
          <div class='pia-onboarding-steps'>4/7</div>
        `,
        position: 'right'
      })
      .addStep({
        tooltipclass: 'pia-onboarding-entry-step-5',
        element: document.querySelectorAll('.sections-4-title')[0],
        intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.entry.step5.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.entry.step5.description')}
          </div>
          <div class='pia-onboarding-steps'>5/7</div>
        `,
        position: 'right'
      })
      .addStep({
        tooltipclass: 'pia-onboarding-entry-knowledgebase',
        element: document.querySelectorAll('.pia-rightSidebarBlock')[0],
        intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.entry.step6.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.entry.step6.description')}
          </div>
          <div class='pia-onboarding-steps'>6/7</div>
        `,
        position: 'left'
      })
      .addStep({
        tooltipclass: 'pia-onboarding-entry-export',
        element: document.querySelectorAll('.pia-rightSidebarBlock')[0],
        intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.entry.step7.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.entry.step7.description')}
          </div>
          <div class='pia-onboarding-steps'>7/7</div>
        `,
        position: 'left'
      })
      .onbeforechange(targetElement => {
        // console.log(targetElement)
        // console.log(i, targetElement.classList.contains('pia-rightSidebarBlock'))
        if (targetElement.classList.contains('pia-rightSidebarBlock')) {
          if (i == 1) {
            this.entrySideViewChange.next('export');
          }
          i++;
        }
      })
      .onexit(() => {
        this.entrySideViewChange.next('knowledge');
      })
      .setOption('nextLabel', 'SUIVANT')
      .setOption('skipLabel', 'PASSER')
      .setOption('doneLabel', 'TERMINER')
      .setOption('showBullets', false)
      .start();
  }

  private prepareEvaluationsOnBoarding() {
    let INTROJS = introJs();
    INTROJS.addStep({
      tooltipclass: 'pia-onboarding-evaluation-step-1',
      element: document.querySelectorAll('.pia-evaluationBlock')[0],
      intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.evaluation.step1.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.evaluation.step1.description')}
          </div>
          <div class='pia-onboarding-steps'>1/4</div>
        `,
      position: 'top'
    }).addStep({
      // Cancel btn
      tooltipclass: 'pia-onboarding-evaluation-step-1',
      element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[0],
      intro: `
          <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.evaluation.step2.title')}</div>
          <div class='pia-onboarding-description'>
            ${this._translateService.instant('onboarding.evaluation.step2.description')}
          </div>
          <div class='pia-onboarding-steps'>2/4</div>
        `,
      position: 'top'
    });

    // to eval btn
    if (document.querySelectorAll('.pia-evaluationBlock-buttons button').length > 2) {
      INTROJS.addStep({
        tooltipclass: 'pia-onboarding-evaluation-step-1',
        element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[1],
        intro: `
              <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.evaluation.step3.title')}</div>
              <div class='pia-onboarding-description'>
                ${this._translateService.instant('onboarding.evaluation.step3.description')}
              </div>
              <div class='pia-onboarding-steps'>3/4</div>
            `,
        position: 'top'
      }).addStep({
        tooltipclass: 'pia-onboarding-evaluation-step-1',
        element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[2],
        intro: `
              <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.evaluation.step4.title')}</div>
              <div class='pia-onboarding-description'>
                ${this._translateService.instant('onboarding.evaluation.step4.description')}
              </div>
              <div class='pia-onboarding-steps'>4/4</div>
            `,
        position: 'top'
      });
    } else {
      INTROJS.addStep({
        tooltipclass: 'pia-onboarding-evaluation-step-1',
        element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[1],
        intro: `
                <div class='pia-onboarding-title'>${this._translateService.instant('onboarding.evaluation.step4.title')}</div>
                <div class='pia-onboarding-description'>
                  ${this._translateService.instant('onboarding.evaluation.step4.description')}
                </div>
                <div class='pia-onboarding-steps'>4/4</div>
              `,
        position: 'top'
      });
    }
    INTROJS.setOption('nextLabel', 'SUIVANT')
      .setOption('skipLabel', 'PASSER')
      .setOption('doneLabel', 'TERMINER')
      .setOption('showBullets', false)
      .start();
  }

  public start(onBoarding: string) {
    switch (onBoarding) {
      case 'entry':
        setTimeout(() => {
          // console.log('start onBoarding entry', document.querySelectorAll('.pia-sectionsBlock')[0]);
          this.prepareEntryOnBoarding();
        }, 1000);
        break;
      case 'evaluation':
        setTimeout(() => {
          // console.log('start onBoarding evaluation', document.querySelectorAll('.pia-evaluationBlock')[0]);
          this.prepareEvaluationsOnBoarding();
        }, 1000);
        break;
      default:
        break;
    }
  }
}
