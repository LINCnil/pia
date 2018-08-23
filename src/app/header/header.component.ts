import { Component, OnInit, OnDestroy } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { PiaService } from '../entry/pia.service';
import { LanguagesService } from '../services/languages.service';
import { AuthenticationService } from '@security/authentication.service'
import { ProfileSession } from 'app/services/profile-session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public increaseContrast: string;
  public profile: any;
  private profileSubscription: Subscription;
  appVersion: string;
  headerForHome: boolean;
  _hasPortfolio: boolean = false;
  _hasOwnStructure: boolean = false;
  public currentRoute: string;

  constructor(
    private _router: Router,
    private renderer: Renderer2,
    public _piaService: PiaService,
    private _http: HttpClient,
    public _languagesService: LanguagesService,
    private authService: AuthenticationService,
    protected session: ProfileSession
  ) {
    this.updateContrast();
  }

  ngOnInit() {
    this.appVersion = environment.version;

    // Set the visibility for the PIA example button according to the current url
    this.headerForHome = (
      this._router.url === '/home' ||
      this._router.url === '/about' ||
      this._router.url === '/help' ||
      this._router.url === '/settings'
    ) ? true : false;

    this.currentRoute = this._router.url;

    this.profileSubscription = this.authService.profileSubject.subscribe(profile => {
      this.profile = profile;
    });

    this._hasPortfolio = this.session.hasPortfolioStructures();
    this._hasOwnStructure = this.session.hasOwnStructure();
  }

  hasPortfolio() {
    return this._hasPortfolio;
  }

  hasOwnStructure() {
    return this._hasOwnStructure;
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe();
  }

  /**
   * Manually updates the contrast. Can be executed by users through header.
   * @param {any} event - Any kind of event.
   * @memberof HeaderComponent
   */
  changeContrast(event: any) {
    localStorage.setItem('increaseContrast', event.target.checked);
    this.updateContrast();
  }

  /**
   * Updates colors contrast on the whole application for people with visual disabilities.
   * @private
   * @memberof HeaderComponent
   */
  private updateContrast() {
    this.increaseContrast = localStorage.getItem('increaseContrast');
    if (this.increaseContrast === 'true') {
      this.renderer.addClass(document.body, 'pia-contrast');
    } else {
      this.renderer.removeClass(document.body, 'pia-contrast');
    }
  }

  /**
   * Import PIA example.
   * @returns {Promise}
   * @memberof HeaderComponent
   */
  importPiaExample() {
    this._http.get('./assets/files/2018-02-21-pia-example.json').map(res => res).subscribe(data => {
      this._piaService.importData(data, 'EXAMPLE', false, false).then(() => {
        this._router.navigate(['home']);
      });
    });
  }

  logoutAction() {
    this.authService.logout();
    window.location.reload();
  }
}
