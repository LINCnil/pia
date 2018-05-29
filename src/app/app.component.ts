import { Component, Renderer2, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { LanguagesService } from 'app/services/languages.service';
import { PermissionsService } from '@security/permissions.service';


@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Pipe({ name: 'nl2br' })
export class Nl2brPipe implements PipeTransform {
  constructor() { }
  transform(value) {
    return value.replace(/\n/g, '<br>');
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: []
})
export class AppComponent {
  constructor(
    private _renderer: Renderer2,
    private _http: HttpClient,
    private _knowledgeBaseService: KnowledgeBaseService,
    private _languagesService: LanguagesService,
    private permissionsService: PermissionsService
  ) {

    this._knowledgeBaseService.loadData(this._http);
    const increaseContrast = localStorage.getItem('increaseContrast');

    if (increaseContrast === 'true') {
      this._renderer.addClass(document.body, 'pia-contrast');
    } else {
      this._renderer.removeClass(document.body, 'pia-contrast');
    }

    // Languages initialization
    this._languagesService.initLanguages();
    this._languagesService.getOrSetCurrentLanguage();

    // ngxPermissions wrapper

     /*
     PERMISSIONS

     pia = [
     'CanCreatePIA', 'CanCreatePIAExample', 'CanEditPIA','CanShowPIA',
     'CanEvaluatePIA', 'CanCancelEvaluatePIA', 'CanValidatePIA', 'CanCancelValidatePIA',
     'CanDeletePIA', 'CanExportPIA']
     sections = ['AccessToContextSection', 'AccessToPrinciplesSection', 'AccessToRisksSection', 'AccessToValidationSection']
      */

    this.permissionsService.loadRolesAndPermissions({
      'ROLE_USER': [],
      'ROLE_CONTROLLER': [
        'CanEditPIA', 'CanCancelEvaluatePIA',
        'AccessToContextSection', 'AccessToPrinciplesSection', 'AccessToRisksSection'
      ],
      'ROLE_DPO': [
        'CanCreatePIA', 'CanCreatePIAExample', 'CanShowPIA',
        'CanEvaluatePIA', 'CanValidatePIA', 'CanCancelValidatePIA',
        'CanDeletePIA', 'CanExportPIA',
        'AccessToContextSection', 'AccessToPrinciplesSection', 'AccessToRisksSection', 'AccessToValidationSection'
      ],
      'ROLE_ADMIN': [
        'CanCreatePIA', 'CanCreatePIAExample', 'CanEditPIA', 'CanShowPIA',
        'CanEvaluatePIA', 'CanCancelEvaluatePIA', 'CanValidatePIA', 'CanCancelValidatePIA',
        'CanDeletePIA', 'CanExportPIA',
        'AccessToContextSection', 'AccessToPrinciplesSection', 'AccessToRisksSection', 'AccessToValidationSection'
      ],
      'ROLE_SUPER_ADMIN': []
    });

  }
}
