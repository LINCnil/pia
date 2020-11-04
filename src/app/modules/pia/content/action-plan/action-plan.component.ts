import { Component, OnInit, Input } from '@angular/core';

import { ActionPlanService } from './action-plan.service';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.scss']
})
export class ActionPlanComponent implements OnInit {

  @Input() pia: any;
  @Input() data: any;

  constructor(public actionPlanService: ActionPlanService) { }

  ngOnInit() {
    this.actionPlanService.pia = this.pia;
    this.actionPlanService.data = this.data;
    this.actionPlanService.listActionPlan();
  }
}
