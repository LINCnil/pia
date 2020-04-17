import { Component, OnInit, Input } from '@angular/core';
import { ModalsService } from 'src/app/modals/modals.service';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: '.app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  providers: [ModalsService]
})
export class ListItemComponent implements OnInit {
  @Input() base: KnowledgeBase;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _modalsService: ModalsService,
    private _knowledgesService: KnowledgesService
  ) {}

  ngOnInit() {}

  onFocusOut(attribute: string, event: any) {
    const text = event.target.innerText;
    this.base[attribute] = text;
    this.base.update();
    // this.base.emit(this.structure);
  }

  remove(id) {
    this._knowledgesService.selected = id;
    this._modalsService.openModal('modal-remove-knowledgebase');
  }

  export(id) {
    this._knowledgesService.export(id);
  }

  duplicate(id) {
    this._knowledgesService.duplicate(id);
  }
}
