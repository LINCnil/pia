import { Component, OnInit, Input } from '@angular/core';

import { SidStatusService } from 'src/app/services/sid-status.service';
import { Pia } from 'src/app/models/pia.model';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss']
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
