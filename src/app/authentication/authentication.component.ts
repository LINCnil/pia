import { Component, OnInit, OnDestroy } from '@angular/core';
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit, OnDestroy {

  constructor(private renderer: Renderer2) {
    this.renderer.addClass(document.body, 'pia-authentication');
  }

  ngOnInit() {
  }

  /**
   * Removes authentication class on component destruction, so that it is not shown on other pages.
   * @memberof AuthenticationComponent
   */
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'pia-authentication');
  }

}
