import { Component, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-knowledge-base-item',
  templateUrl: './knowledge-base-item.component.html',
  styleUrls: ['./knowledge-base-item.component.scss']
})
export class KnowledgeBaseItemComponent implements OnInit {

  @Input() item: any;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private el: ElementRef, private router: Router, private activatedRoute: ActivatedRoute) {
    this.router = router;
  }

  ngOnInit() {
  }

  /**
   * Shows or hides an help item.
   */
  displayItem() {
    const accordeon = this.el.nativeElement.querySelector('.pia-knowledgeBaseBlock-item-accordion button span');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector('.pia-knowledgeBaseBlock-item-content');
    displayer.classList.toggle('hide');
  }

  /**
   * Adds a measure to the PIA.
   * This is used mainly on "Mesures préventives et existantes" subsection.
   */
  addNewMeasure() {
    this.newMeasureEvent.emit(this.item);
  }

}
