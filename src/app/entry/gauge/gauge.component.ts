import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss']
})
export class GaugeComponent implements OnInit {

@Input() evaluationGauge: boolean;

  constructor() { }

  ngOnInit() {
  }

  /**
   * Returns the gauge type (question gauge or evaluation gauge).
   * @returns {boolean} true if it's an evaluation gauge, false otherwise.
   */
  getGaugeType() {
    return this.evaluationGauge;
  }

}
