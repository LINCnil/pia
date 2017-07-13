import { Component, OnInit } from '@angular/core';
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public increaseContrast: String;

  constructor(private renderer: Renderer2) {
    this.updateContrast();
  }

  ngOnInit() {
  }

  /**
   * Manually updates the contrast. Can be executed by users through header.
   * TODO : To update when we know what it is.
   * @param {Any} event - Any kind of event
   */
  changeContrast(event: any) {
    localStorage.setItem('increaseContrast', event.target.checked);
    this.updateContrast();
  }

  /**
   * Updates colors contrast on the whole application for people with visual disabilities.
   */
  private updateContrast() {
    this.increaseContrast = localStorage.getItem('increaseContrast');
    if (this.increaseContrast == 'true')
      this.renderer.addClass(document.body, 'pia-contrast');
    else
      this.renderer.removeClass(document.body, 'pia-contrast');
  }
}
