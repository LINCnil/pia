import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(private renderer: Renderer2,
              public translateService: TranslateService,
              public languagesService: LanguagesService) {
    this.renderer.addClass(document.body, 'pia-authentication');
  }

  ngOnInit(): void {
    const displayMessage = document.querySelector('.pia-closeFullScreenModeAlertBlock');
    window.screenTop === 0 && window.screenY === 0 ? displayMessage.classList.remove('hide') : displayMessage.classList.add('hide');
    window.onresize = (event) => {
      window.screenTop === 0 && window.screenY === 0 ? displayMessage.classList.remove('hide') : displayMessage.classList.add('hide');
    };
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'pia-authentication');
  }

}
