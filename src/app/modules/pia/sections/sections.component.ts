import { Component, OnInit, Input } from '@angular/core';

import { SidStatusService } from 'src/app/services/sid-status.service';
import { Pia } from 'src/app/models/pia.model';
import {
  faCalendarCheck,
  faPenToSquare,
  faGear,
  faSquareCheck,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  standalone: false
})
export class SectionsComponent implements OnInit {
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
  @Input() pia: Pia = null;
  @Input() section: {
    id: number;
    title: string;
    short_help: string;
    items: any;
  };
  @Input() item: {
    id: number;
    title: string;
    evaluation_mode: string;
    short_help: string;
    questions: any;
  };
  @Input() data: { sections: any };
  loading = false;

  protected readonly faCalendarCheck = faCalendarCheck;
  protected readonly faPenToSquare = faPenToSquare;
  protected readonly faGear = faGear;
  protected readonly faSquareCheck = faSquareCheck;
  protected readonly faChartLine = faChartLine;

  constructor(public sidStatusService: SidStatusService) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    for (const section of this.data.sections) {
      for (const item of section.items) {
        await this.sidStatusService.setSidStatus(this.pia, section, item);
      }
    }
    this.loading = false;
  }
}
