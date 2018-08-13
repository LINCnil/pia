import { Component, OnInit, OnDestroy } from '@angular/core';
import { Renderer2 } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit, OnDestroy {
  constructor(private _renderer: Renderer2,
              public _translateService: TranslateService,
              public _languagesService: LanguagesService) {
    this._renderer.addClass(document.body, 'pia-authentication');
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._renderer.removeClass(document.body, 'pia-authentication');
  }
}
