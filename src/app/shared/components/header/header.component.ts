import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

import { LanguagesService } from 'src/app/services/languages.service';
import { IntrojsService } from 'src/app/services/introjs.service';
import { Renderer2 } from '@angular/core';
import { Pia } from 'src/app/models/pia.model';
import { AppDataService } from 'src/app/services/app-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public increaseContrast: string;
  appVersion: string;
  pia_is_example: boolean;
  pia_example: Pia;
  isKnowledgeHeader: boolean;
  isStructureHeader: boolean;
  isArchiveHeader: boolean;
  private renderer: Renderer2;

  constructor(
    public router: Router,
    private introjsService: IntrojsService,
    public translateService: TranslateService,
    public languagesService: LanguagesService,
    public appDataService: AppDataService) { }

  ngOnInit(): void {
    const displayMessage = document.querySelector('.pia-closeFullScreenModeAlertBlock');
    window.screenTop === 0 && window.screenY === 0 ? displayMessage.classList.remove('hide') : displayMessage.classList.add('hide');
    window.onresize = () => {
      window.screenTop === 0 && window.screenY === 0 ? displayMessage.classList.remove('hide') : displayMessage.classList.add('hide');
    };

    this.appVersion = environment.version;

    this.pia_is_example = false;

    // Load pia
    // this._piaService.getPIA().then(() => {
    //   if (this._piaService.pia.is_example === 1) {
    //     this.pia_example = this._piaService.pia;
    //     this.pia_is_example = true;
    //   } else {
    //     console.log('debug');
    //     this.loadPiaExample();
    //   }
    // });

    if (this.router.url.indexOf('/structures/') > -1) {
      this.isStructureHeader = true;
    }
    if (this.router.url.indexOf('/archives/') > -1) {
      this.isArchiveHeader = true;
    }
    if (this.router.url.indexOf('/knowledges') > -1) {
      this.isKnowledgeHeader = true;
    }
  }


  /**
   * Restart the onboarding module for the current user
   */
  restartOnboarding(): void {
    localStorage.removeItem('onboardingEvaluationConfirmed');
    localStorage.removeItem('onboardingDashboardConfirmed');
    localStorage.removeItem('onboardingEntryConfirmed');
    localStorage.removeItem('onboardingValidatedConfirmed');
    // location.reload();
    this.introjsService.reset();
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  /**
   * Manually updates the contrast. Can be executed by users through header.
   * @param {any} event - Any kind of event.
   */
  changeContrast(event: any): void {
    localStorage.setItem('increaseContrast', event.target.checked);
    this.updateContrast();
  }

  /**
   * Updates colors contrast on the whole application for people with visual disabilities.
   * @private
   */
  private updateContrast(): void {
    this.increaseContrast = localStorage.getItem('increaseContrast');
    if (this.increaseContrast === 'true') {
      this.renderer.addClass(document.body, 'pia-contrast');
    } else {
      this.renderer.removeClass(document.body, 'pia-contrast');
    }
  }

  // TODO: move in .html only
  goToExample(): void {
    if (this.pia_example) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['entry', this.pia_example.id, 'section', 1, 'item', 1]);
      });
    }
  }
}
