import { Component, Input, OnInit } from '@angular/core';
import { Structure } from 'src/app/models/structure.model';
import { AppDataService } from 'src/app/services/app-data.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { StructureService } from 'src/app/services/structure.service';
import { faSitemap } from '@fortawesome/free-solid-svg-icons/faSitemap';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  standalone: false
})
export class SectionsComponent implements OnInit {
  @Input() structure: Structure;
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

  protected readonly faSitemap = faSitemap;

  constructor(
    public structureService: StructureService,
    public sidStatusService: SidStatusService
  ) {}

  async ngOnInit() {
    this.data = this.structure.data;
  }
}
