import { Component, OnInit, Input } from '@angular/core';
import 'rxjs/add/operator/map';


import { AppDataService } from 'src/app/services/app-data.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { PiaService } from 'src/app/services/pia.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { IntrojsService } from 'src/app/services/introjs.service';
import { Pia } from 'src/app/models/pia.model';



@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: [PiaService]
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
  data: { sections: any };

  constructor(
    private appDataService: AppDataService,
    public sidStatusService: SidStatusService,
    private introjsService: IntrojsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.data = this.appDataService.dataNav;
    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        this.sidStatusService.setSidStatus(this.pia, section, item);
      });
    });
  }

  ngAfterViewChecked(): void {
    if (!this.introjsService.sectionsLoaded) {
      this.introjsService.sections(true);
    }
  }
}
