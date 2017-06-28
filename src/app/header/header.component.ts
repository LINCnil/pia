import { Component, OnInit } from '@angular/core';
import { Renderer2 } from "@angular/core";

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

  changeContrast(event: any) {
    localStorage.setItem('increaseContrast', event.target.checked);
    this.updateContrast();
  }

  private updateContrast() {
    this.increaseContrast = localStorage.getItem('increaseContrast');
    if (this.increaseContrast == 'true')
      this.renderer.addClass(document.body, 'pia-contrast');
    else
      this.renderer.removeClass(document.body, 'pia-contrast');
  }
}
