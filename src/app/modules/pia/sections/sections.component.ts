import { Component, OnInit, Input } from '@angular/core';
import 'rxjs/add/operator/map';


import { SidStatusService } from 'src/app/services/sid-status.service';
import { PiaService } from 'src/app/services/pia.service';
import { IntrojsService } from 'src/app/services/introjs.service';
import { Pia } from 'src/app/models/pia.model';



@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss']
})
export class SectionsComponent implements OnInit {
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

  constructor(
    public sidStatusService: SidStatusService,
    private introjsService: IntrojsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        this.sidStatusService.setSidStatus(this.pia, section, item);
      });
    });
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewChecked(): void {
    if (!this.introjsService.sectionsLoaded) {
      this.introjsService.sections(true);
    }
  }
}
