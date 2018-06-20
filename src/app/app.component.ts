import { Component, Renderer2, Pipe, PipeTransform, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { LanguagesService } from 'app/services/languages.service';
import { PermissionsService } from '@security/permissions.service';
import { NgxPermissionsConfigurationService } from 'ngx-permissions';


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
    private permissionsService: PermissionsService,
    private ngxPermissionsConfigurationService: NgxPermissionsConfigurationService
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

     /*  PERMISSIONS */

    let roles = {};

    roles['ROLE_USER'] = [];

    roles['ROLE_CONTROLLER'] = [
      'CanEditPIA', 'CanCancelEvaluatePIA', 'CanAskEvaluatePIA',
      'AccessToContextSection', 'AccessToPrinciplesSection', 'AccessToRisksSection'
    ];
    roles['ROLE_DPO'] = roles['ROLE_CONTROLLER'].concat([
      'CanCreatePIA', 'CanCreatePIAExample', 'CanShowPIA',
      'CanEvaluatePIA', 'CanValidatePIA', 'CanCancelValidatePIA',
      'CanDeletePIA','CanImportPIA', 'CanExportPIA', 'CanCreateFolder',
       'AccessToValidationSection'
    ]);

    roles['ROLE_ADMIN'] = [].concat(roles['ROLE_DPO']);
    roles['ROLE_TECHNICAL_ADMIN'] = [].concat(roles['ROLE_ADMIN']);
    roles['ROLE_SUPER_ADMIN'] = [].concat(roles['ROLE_TECHNICAL_ADMIN']);

    this.permissionsService.loadRolesAndPermissions(roles);
/*
    this.ngxPermissionsConfigurationService.addPermissionStrategy('disable', (templateRef: TemplateRef<any>) => {
      this._renderer.setAttribute(templateRef.elementRef.nativeElement.nextSibling, 'disabled', 'true');
    });

    this.ngxPermissionsConfigurationService.addPermissionStrategy('enable', (templateRef: TemplateRef<any>) => {
      this._renderer.removeAttribute(templateRef.elementRef.nativeElement.nextSibling, 'disabled');
    });

    this.ngxPermissionsConfigurationService.setDefaultOnUnauthorizedStrategy('disable');
*/
  }
}
