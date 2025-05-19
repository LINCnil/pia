import {
  Component,
  ElementRef,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';

@Component({
  selector: 'app-knowledge-base-item',
  templateUrl: './knowledge-base-item.component.html',
  styleUrls: ['./knowledge-base-item.component.scss'],
  standalone: false
})
export class KnowledgeBaseItemComponent implements OnInit {
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
  @Input() item: any;
  @Input() itemKb: any;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();
  titleKb: string;

  constructor(
    private el: ElementRef,
    private router: Router,
    private _knowledgeBaseService: KnowledgeBaseService,
    private _translateService: TranslateService,
    public _globalEvaluationService: GlobalEvaluationService
  ) {
    this.router = router;
  }

  ngOnInit() {
    this._translateService.get(this.itemKb.name).subscribe(value => {
      this.titleKb = value;
    });
  }

  /**
   * Shows or hides an help item.
   */
  displayItem() {
    const accordion = this.el.nativeElement.querySelector(
      '.pia-knowledgeBaseBlock-item-accordion button span'
    );
    const displayer = this.el.nativeElement.querySelector(
      '.pia-knowledgeBaseBlock-item-content'
    );
    if (displayer.classList.contains('hide')) {
      displayer.classList.remove('hide');
      accordion.classList.remove('pia-icon-accordion-down');
      accordion.classList.add('pia-icon-accordion-up');
    } else {
      displayer.classList.add('hide');
      accordion.classList.remove('pia-icon-accordion-up');
      accordion.classList.add('pia-icon-accordion-down');
    }
  }

  /**
   * Adds a measure to the PIA.
   * This is used mainly on "Mesures préventives et existantes" subsection.
   */
  addNewMeasure() {
    this.newMeasureEvent.emit(this.itemKb);
  }
}
