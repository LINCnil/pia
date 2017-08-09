import { Component, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { KnowledgeBaseService } from '../knowledge-base.service';

@Component({
  selector: 'app-knowledge-base-item',
  templateUrl: './knowledge-base-item.component.html',
  styleUrls: ['./knowledge-base-item.component.scss']
})
export class KnowledgeBaseItemComponent implements OnInit {

  @Input() item: any;
  @Input() itemKb: any;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private el: ElementRef, private router: Router,
              private _knowledgeBaseService: KnowledgeBaseService,
              private activatedRoute: ActivatedRoute) {
    this.router = router;
  }

  ngOnInit() {
  }

  /**
   * Shows or hides an help item.
   */
  displayItem() {
    const accordeon = this.el.nativeElement.querySelector('.pia-knowledgeBaseBlock-item-accordion button span');
    const displayer = this.el.nativeElement.querySelector('.pia-knowledgeBaseBlock-item-content');
    if (displayer.classList.contains('hide')) {
      displayer.classList.remove('hide');
      accordeon.classList.remove('pia-icon-accordeon-up');
      accordeon.classList.add('pia-icon-accordeon-down');
    } else {
      displayer.classList.add('hide');
      accordeon.classList.remove('pia-icon-accordeon-down');
      accordeon.classList.add('pia-icon-accordeon-up');
    }
  }

  /**
   * Adds a measure to the PIA.
   * This is used mainly on "Mesures préventives et existantes" subsection.
   */
  addNewMeasure() {
    this.newMeasureEvent.emit(this.itemKb);
  }

  displayKb() {
    if (this.item) {
      if (this.item.filter_by !== 'measure') {
        return true;
      } else {
        if (this.itemKb && this.itemKb.filters.startsWith('measure.')
            && (!this._knowledgeBaseService.filter || this._knowledgeBaseService.filter.length === 0)) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

}
