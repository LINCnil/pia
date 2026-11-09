import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActionPlanService } from 'src/app/services/action-plan.service';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ActionPlanComponent implements OnInit {
  @Input() pia: any;
  @Input() data: any;

  constructor(public actionPlanService: ActionPlanService) {}

  async ngOnInit(): Promise<void> {
    this.actionPlanService.pia = this.pia;
    this.actionPlanService.data = this.data;
    await this.actionPlanService.listActionPlan().then(() => {});
  }
}
