import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ProcessingModel } from '@api/models';
import { ProcessingFormComponent } from './processing-form/processing-form.component';

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingComponent implements OnInit {
  @ViewChild(ProcessingFormComponent) formComponent: ProcessingFormComponent;
  processing: ProcessingModel;
  sections: any;
  currentSection: Section;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.sections = this.route.snapshot.data.sections;
    this.processing = this.route.snapshot.data.processing;

    this.changeSection(1);
  }

  /**
   * Change current section
   *
   * @param sectionId
   */
  changeSection(sectionId) {
    this.currentSection = this.sections.filter((section) => section.id === sectionId)[0];
  }

  public displayKnowledgeBaseForSection(section?: Section): void {
    if (section === null) {
      section = this.sections
    }
    if (section.id === 1) {
      this.formComponent.updateKnowledgeBase([
        'PIA_LGL_DESC',
        'PIA_LGL_FIN',
        'PIA_LGL_FOND'
      ]);
    }
    if (section.id === 2) {
      this.formComponent.updateKnowledgeBase([
        'PIA_LGL_DATA',
        'PIA_LGL_DUR'
      ]);
    }
    if (section.id === 3) {
      this.formComponent.updateKnowledgeBase([
        'PIA_LGL_LFC',
        'PIA_LGL_ST',
        'PIA_LGL_DEST',
        'PIA_LGL_TRAN'
      ]);
    }
  }
}

interface Section {
  id: number
  title: string
  evaluation_mode: string
  short_help: string
  questions: any
}
