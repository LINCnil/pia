import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'app/services/languages.service';
import { User } from 'app/authentication/user.model';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent{
  private form;
  private model;

  constructor(
              public _translateService: TranslateService,
              public _languagesService: LanguagesService) {
  }

  submitted = false;

  onSubmit() { 
    this.submitted = true; 
    console.log(this.model);
  }

}
