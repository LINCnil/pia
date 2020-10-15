import { Injectable, OnChanges } from '@angular/core';

import { Router } from '@angular/router';
import * as introJs from 'intro.js/intro.js';

import { TranslateService } from '@ngx-translate/core';
import { SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class IntrojsService {
  public sectionsLoaded: boolean = null;
  sectionsChange: Subject<any> = new Subject<any>();
  public evaluationsLoaded: boolean = null;
  evaluationsChange: Subject<any> = new Subject<any>();

  public entrySideView = 'knowledge';
  entrySideViewChange: Subject<any> = new Subject<any>();

  private introjsChecked = false;

  constructor(private router: Router, private translateService: TranslateService) {
    this.sectionsChange.subscribe(bool => {
      if (!this.introjsChecked) {
        console.log('changements sections', bool);
        this.sectionsLoaded = bool;
        this.autoSelectOnBoarding();
      }
    });
    this.evaluationsChange.subscribe(bool => {
      if (!this.introjsChecked) {
        console.log('changements evaluations', bool);
        this.evaluationsLoaded = bool;
        this.autoSelectOnBoarding();
      }
    });
  }

  reset(): void {
    this.sectionsLoaded = null;
    this.evaluationsLoaded = null;
    this.introjsChecked = false;
  }

  sections(bool): void {
    this.sectionsChange.next(bool);
  }

  evaluations(bool): void {
    this.evaluationsChange.next(bool);
  }

  public autoSelectOnBoarding(): void {
    if (this.sectionsLoaded !== null && this.evaluationsLoaded !== null) {
      if (this.evaluationsLoaded === true) {
        console.log('EVALUATION INTROJS');
        this.start('evaluation');
        this.introjsChecked = true;
      } else {
        if (!localStorage.getItem('onboardingEntryConfirmed')) {
          console.log('ENTRY INTROJS');
          this.start('entry');
          this.introjsChecked = true;
        }
      }
    }
  }

  /**
   * Prepare onboarding for the Dashboard page
   */
  private prepareDashboardOnBoarding(): void {
    const INTROJS = introJs();
    INTROJS.addStep({
      element: document.querySelector('.pia-newBlock-item.front'),
      tooltipClass: 'pia-onboarding-dashboard-1',
      intro: `
      <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.dashboard.step1.title')}</div>
      <div class='pia-onboarding-description'>
        ${this.translateService.instant('onboarding.dashboard.step1.description')}
      </div>
      <div class='pia-onboarding-steps'>1/5</div>
    `,
      position: 'right'
    })
      .addStep({
        element: document.querySelector('.pia-cardsBlock.pia-editBlock.back'),
        tooltipClass: 'pia-onboarding-dashboard-2',
        intro: `
      <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.dashboard.step2.title')}</div>
      <div class='pia-onboarding-description'>
        ${this.translateService.instant('onboarding.dashboard.step2.description')}
      </div>
      <div class='pia-onboarding-steps'>2/5</div>
    `,
        position: 'right'
      })
      .addStep({
        element: document.querySelector('.pia-cardsBlock.pia-editBlock.back'),
        tooltipClass: 'pia-onboarding-dashboard-3',
        intro: `
      <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.dashboard.step3.title')}</div>
      <div class='pia-onboarding-description'>
        ${this.translateService.instant('onboarding.dashboard.step3.description')}
      </div>
      <div class='pia-onboarding-steps'>3/5</div>
    `,
        position: 'right'
      })
      .addStep({
        element: document.querySelector('.pia-cardsBlock.pia-editBlock.back'),
        tooltipClass: 'pia-onboarding-dashboard-4',
        intro: `
      <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.dashboard.step4.title')}</div>
      <div class='pia-onboarding-description'>
        ${this.translateService.instant('onboarding.dashboard.step4.description')}
      </div>
      <div class='pia-onboarding-steps'>4/5</div>
    `,
        position: 'right'
      })
      .addStep({
        element: document.querySelector('.pia-cardsBlock.pia-editBlock.back'),
        tooltipClass: 'pia-onboarding-dashboard-5',
        intro: `
      <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.dashboard.step5.title')}</div>
      <div class='pia-onboarding-description'>
        ${this.translateService.instant('onboarding.dashboard.step5.description')}
      </div>
      <div class='pia-onboarding-steps'>5/5</div>
    `,
        position: 'right'
      })
      .onbeforechange(targetElement => {
        if (targetElement.classList.contains('back')) {
          const cardsToSwitch = document.getElementById('cardsSwitch');
          cardsToSwitch.classList.add('flipped');
        }
      })
      .onexit(() => {
        localStorage.setItem('onboardingDashboardConfirmed', 'true');
      })
      .setOption('keyboardNavigation', false)
      .setOption('exitOnOverlayClick', false)
      .setOption('disableInteraction', true)
      .setOption('nextLabel', this.translateService.instant('onboarding.general.next'))
      .setOption('skipLabel', this.translateService.instant('onboarding.general.skip'))
      .setOption('doneLabel', this.translateService.instant('onboarding.general.done'))
      .setOption('showBullets', false)
      .start();
  }

  /**
   * Prepare onboarding for a PIA edit page
   */
  private prepareEntryOnBoarding(): void {
    let i = 0;
    const INTROJS = introJs();
    INTROJS.addStep({
      tooltipClass: 'pia-onboarding-entry-1',
      element: document.querySelector('.pia-sectionsBlock'),
      intro: `
          <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.entry.step1.title')}</div>
          <div class='pia-onboarding-description'>
            ${this.translateService.instant('onboarding.entry.step1.description')}
          </div>
          <div class='pia-onboarding-steps'>1/7</div>
        `,
      position: 'right'
    })
      .addStep({
        tooltipClass: 'pia-onboarding-entry-2',
        element: document.querySelector('.pia-sectionsBlock'),
        intro: `
        <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.entry.step2.title')}</div>
        <div class='pia-onboarding-description'>
          ${this.translateService.instant('onboarding.entry.step2.description')}
        </div>
        <div class='pia-onboarding-steps'>2/7</div>
      `,
        position: 'right'
      })
      .addStep({
        tooltipClass: 'pia-onboarding-entry-3',
        element: document.querySelector('.pia-sectionsBlock'),
        intro: `
        <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.entry.step3.title')}</div>
        <div class='pia-onboarding-description'>
          ${this.translateService.instant('onboarding.entry.step3.description')}
        </div>
        <div class='pia-onboarding-steps'>3/7</div>
      `,
        position: 'right'
      })
      .addStep({
        tooltipClass: 'pia-onboarding-entry-4',
        element: document.querySelector('.pia-sectionsBlock'),
        intro: `
        <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.entry.step4.title')}</div>
        <div class='pia-onboarding-description'>
          ${this.translateService.instant('onboarding.entry.step4.description')}
        </div>
        <div class='pia-onboarding-steps'>4/7</div>
      `,
        position: 'right'
      })
      .addStep({
        tooltipClass: 'pia-onboarding-entry-5',
        element: document.querySelector('.pia-sectionsBlock'),
        intro: `
        <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.entry.step5.title')}</div>
        <div class='pia-onboarding-description'>
          ${this.translateService.instant('onboarding.entry.step5.description')}
        </div>
        <div class='pia-onboarding-steps'>5/7</div>
      `,
        position: 'right'
      })
      .addStep({
        tooltipClass: 'pia-onboarding-entry-6',
        element: document.querySelector('.pia-rightSidebarBlock'),
        intro: `
        <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.entry.step6.title')}</div>
        <div class='pia-onboarding-description'>
          ${this.translateService.instant('onboarding.entry.step6.description')}
        </div>
        <div class='pia-onboarding-steps'>6/7</div>
      `,
        position: 'left'
      })
      .addStep({
        tooltipClass: 'pia-onboarding-entry-7',
        element: document.querySelector('.pia-rightSidebarBlock'),
        intro: `
        <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.entry.step7.title')}</div>
        <div class='pia-onboarding-description'>
          ${this.translateService.instant('onboarding.entry.step7.description')}
        </div>
        <div class='pia-onboarding-steps'>7/7</div>
      `,
        position: 'left'
      })
      .onbeforechange(targetElement => {
        if (targetElement.classList.contains('pia-rightSidebarBlock')) {
          if (i == 1) {
            this.entrySideViewChange.next('export');
          }
          i++;
        }
      })
      .onexit(() => {
        this.entrySideViewChange.next('knowledge');
        localStorage.setItem('onboardingEntryConfirmed', 'true');
      })
      .setOption('keyboardNavigation', false)
      .setOption('exitOnOverlayClick', false)
      .setOption('disableInteraction', true)
      .setOption('nextLabel', this.translateService.instant('onboarding.general.next'))
      .setOption('skipLabel', this.translateService.instant('onboarding.general.skip'))
      .setOption('doneLabel', this.translateService.instant('onboarding.general.done'))
      .setOption('showBullets', false)
      .start();
  }

  /**
   * Prepare onboarding for evaluation blocks
   */
  private prepareEvaluationsOnBoarding(): void {
    let stepsQuantity = 3;

    if (document.querySelectorAll('.pia-evaluationBlock-buttons button').length > 2) {
      stepsQuantity = 4;
    }
    if (document.querySelector('.pia-status-info.evaluationsStatus > div')) {
      stepsQuantity = stepsQuantity + 1;
    }

    const INTROJS = introJs();
    INTROJS.addStep({
      // Main evaluation block
      tooltipClass: 'pia-onboarding-evaluation-step-evaluationBlock',
      element: document.querySelector('.pia-evaluationBlock > div'),
      intro: `
          <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.evaluation.step1.title')}</div>
          <div class='pia-onboarding-description'>
            ${this.translateService.instant('onboarding.evaluation.step1.description')}
          </div>
          <div class='pia-onboarding-steps'>1/${stepsQuantity}</div>
        `,
      position: 'top'
    });
    if (document.querySelectorAll('.pia-evaluationBlock-buttons button').length > 2) {
      INTROJS.addStep({
        // "Cancel" button
        tooltipClass: 'pia-onboarding-evaluation-step-refuseButton-tripleButtons',
        element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[0],
        intro: `
            <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.evaluation.step2.title')}</div>
            <div class='pia-onboarding-description'>
              ${this.translateService.instant('onboarding.evaluation.step2.description')}
            </div>
            <div class='pia-onboarding-steps'>2/${stepsQuantity}</div>
          `,
        position: 'top'
      })
        .addStep({
          // "Action plan" button
          tooltipClass: 'pia-onboarding-evaluation-step-actionPlanButton',
          element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[1],
          intro: `
              <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.evaluation.step3.title')}</div>
              <div class='pia-onboarding-description'>
                ${this.translateService.instant('onboarding.evaluation.step3.description')}
              </div>
              <div class='pia-onboarding-steps'>3/${stepsQuantity}</div>
            `,
          position: 'top'
        })
        .addStep({
          // "Acceptable" button
          tooltipClass: 'pia-onboarding-evaluation-step-acceptableButton-tripleButtons',
          element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[2],
          intro: `
              <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.evaluation.step4.title')}</div>
              <div class='pia-onboarding-description'>
                ${this.translateService.instant('onboarding.evaluation.step4.description')}
              </div>
              <div class='pia-onboarding-steps'>4/${stepsQuantity}</div>
            `,
          position: 'top'
        });
      if (document.querySelector('.pia-status-info.evaluationsStatus > div')) {
        INTROJS.addStep({
          // Top evaluation block (cancel block)
          tooltipClass: 'pia-onboarding-evaluation-step-cancelEvaluationBlock',
          element: document.querySelector('.pia-status-info.evaluationsStatus > div'),
          intro: `
                  <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.evaluation.step5.title')}</div>
                  <div class='pia-onboarding-description'>
                    ${this.translateService.instant('onboarding.evaluation.step5.description')}
                  </div>
                  <div class='pia-onboarding-steps'>5/${stepsQuantity}</div>
                `,
          position: 'bottom'
        });
      }
    } else {
      INTROJS.addStep({
        // "Cancel" button
        tooltipClass: 'pia-onboarding-evaluation-step-refuseButton-doubleButtons',
        element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[0],
        intro: `
            <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.evaluation.step2.title')}</div>
            <div class='pia-onboarding-description'>
              ${this.translateService.instant('onboarding.evaluation.step2.description')}
            </div>
            <div class='pia-onboarding-steps'>2/${stepsQuantity}</div>
          `,
        position: 'top'
      }).addStep({
        // "Acceptable" button
        tooltipClass: 'pia-onboarding-evaluation-step-acceptableButton-doubleButtons',
        element: document.querySelectorAll('.pia-evaluationBlock-buttons button')[1],
        intro: `
                <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.evaluation.step4.title')}</div>
                <div class='pia-onboarding-description'>
                  ${this.translateService.instant('onboarding.evaluation.step4.description')}
                </div>
                <div class='pia-onboarding-steps'>3/${stepsQuantity}</div>
              `,
        position: 'top'
      });
      if (document.querySelector('.pia-status-info.evaluationsStatus > div')) {
        INTROJS.addStep({
          // Top evaluation block (cancel block)
          tooltipClass: 'pia-onboarding-evaluation-step-cancelEvaluationBlock',
          element: document.querySelector('.pia-status-info.evaluationsStatus > div'),
          intro: `
                <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.evaluation.step5.title')}</div>
                <div class='pia-onboarding-description'>
                  ${this.translateService.instant('onboarding.evaluation.step5.description')}
                </div>
                <div class='pia-onboarding-steps'>4/${stepsQuantity}</div>
              `,
          position: 'bottom'
        });
      }
    }
    INTROJS.onexit(() => {
      localStorage.setItem('onboardingEvaluationConfirmed', 'true');
    });
    INTROJS.setOption('exitOnOverlayClick', false)
      .setOption('keyboardNavigation', false)
      .setOption('disableInteraction', true)
      .setOption('nextLabel', this.translateService.instant('onboarding.general.next'))
      .setOption('skipLabel', this.translateService.instant('onboarding.general.skip'))
      .setOption('doneLabel', this.translateService.instant('onboarding.general.done'))
      .setOption('showBullets', false)
      .start();
  }

  /**
   * Prepare onboarding for PIA homepage for validated PIAs
   */
  private prepareValidatedOnBoarding(): void {
    const INTROJS = introJs();
    INTROJS.addStep({
      tooltipClass: 'pia-onboarding-validated-1',
      element: document.querySelector('.pia-cardsBlock.pia-archiveBlock'),
      intro: `
                <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.validated.step1.title')}</div>
                <div class='pia-onboarding-description'>
                  ${this.translateService.instant('onboarding.validated.step1.description')}
                </div>
                <div class='pia-onboarding-steps'>1/2</div>
              `,
      position: 'top'
    }).addStep({
      tooltipClass: 'pia-onboarding-validated-2',
      element: document.querySelector('.pia-cardsBlock.pia-archiveBlock'),
      intro: `
                <div class='pia-onboarding-title'>${this.translateService.instant('onboarding.validated.step2.title')}</div>
                <div class='pia-onboarding-description'>
                  ${this.translateService.instant('onboarding.validated.step2.description')}
                </div>
                <div class='pia-onboarding-steps'>2/2</div>
              `,
      position: 'top'
    });

    INTROJS.onexit(() => {
      localStorage.setItem('onboardingValidatedConfirmed', 'true');
    })
      .setOption('exitOnOverlayClick', false)
      .setOption('keyboardNavigation', false)
      .setOption('disableInteraction', true)
      .setOption('nextLabel', this.translateService.instant('onboarding.general.next'))
      .setOption('skipLabel', this.translateService.instant('onboarding.general.skip'))
      .setOption('doneLabel', this.translateService.instant('onboarding.general.done'))
      .setOption('showBullets', false)
      .start();
  }

  /**
   * Start the corresponding onboarding
   * @param onBoarding the name of the onboarding to start
   */
  public start(onBoarding: string): void {
    console.log('start');
    let interval;
    switch (onBoarding) {
      case 'dashboard':
        interval = setInterval(() => {
          if (document.querySelector('.pia-newBlock-item.front')) {
            this.prepareDashboardOnBoarding();
            clearInterval(interval);
          }
        }, 2000);
        break;
      case 'entry':
        interval = setInterval(() => {
          if (document.querySelector('.pia-sectionsBlock')) {
            this.prepareEntryOnBoarding();
            clearInterval(interval);
          }
        }, 2000);
        break;
      case 'validated':
        if (!localStorage.getItem('onboardingValidatedConfirmed')) {
          interval = setInterval(() => {
            if (document.querySelector('.pia-cardsBlock.pia-archiveBlock')) {
              this.prepareValidatedOnBoarding();
              clearInterval(interval);
            }
          }, 2000);
        }
        break;
      case 'evaluation':
        if (!localStorage.getItem('onboardingEvaluationConfirmed')) {
          interval = setInterval(() => {
            if (
              document.querySelector('.pia-evaluationBlock') &&
              document.querySelector('.pia-evaluationBlock-buttons button') &&
              document.querySelector('.pia-evaluationBlock > div')
            ) {
              this.prepareEvaluationsOnBoarding();
              clearInterval(interval);
            }
          }, 2000);
        }
        break;
      default:
        break;
    }
  }
}
