import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

import { LanguagesService } from 'src/app/services/languages.service';
import { IntrojsService } from 'src/app/services/introjs.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  providers: [{ provide: Window, useValue: window }],
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public increaseContrast: string;
  appVersion: string;
  pia_is_example: boolean;
  isKnowledgeHeader: boolean;
  isStructureHeader: boolean;
  isArchiveHeader: boolean;
  userRole: boolean;

  constructor(
    private window: Window,
    public router: Router,
    private introjsService: IntrojsService,
    public translateService: TranslateService,
    public languagesService: LanguagesService,
    public appDataService: AppDataService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.appVersion = environment.version;

    this.pia_is_example = false;

    if (this.router.url.indexOf('/structures/') > -1) {
      this.isStructureHeader = true;
    }
    if (this.router.url.indexOf('/archives/') > -1) {
      this.isArchiveHeader = true;
    }
    if (this.router.url.indexOf('/knowledges') > -1) {
      this.isKnowledgeHeader = true;
    }
    this.updateFullScreenMessage();
    this.window.addEventListener('load', () => {
      this.window.onresize = () => {
        this.updateFullScreenMessage();
      };
    });
  }

  disconnectUser() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  updateFullScreenMessage(): void {
    const displayMessage: HTMLElement = document.querySelector(
      '.pia-closeFullScreenModeAlertBlock'
    );
    if (this.window.innerHeight === screen.height) {
      displayMessage.classList.toggle('hide');
    } else {
      displayMessage.classList.add('hide');
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
    this.introjsService.reset();
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  /**
   * Manually updates the contrast. Can be executed by users through header.
   * @param event - Any kind of event.
   */
  changeContrast(event: any): void {
    localStorage.setItem('increaseContrast', event.target.checked);
    this.appDataService.contrastMode = event.target.checked;
  }

  goToExample(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['pia', 1, 'section', 1, 'item', 1]);
    });
  }
}
