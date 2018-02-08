import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { ActionPlanService } from './action-plan.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.scss']
})
export class ActionPlanComponent implements OnInit {

  @Input() pia: any;
  @Input() data: any;

  constructor(public _actionPlanService: ActionPlanService,
              private _translateService: TranslateService) { }

  ngOnInit() {
    this._actionPlanService.pia = this.pia;
    this._actionPlanService.data = this.data;
    this._actionPlanService.listActionPlan(this._translateService);
  }
}
