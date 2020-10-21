import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { Structure } from 'src/app/models/structure.model';
import { ConfirmDialogService } from 'src/app/services/confirm-dialog.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { ModalsService } from 'src/app/services/modals.service';
import piakb from 'src/assets/files/pia_knowledge-base.json';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-knowledgebase-line]',
  templateUrl: './knowledgebase-line.component.html',
  styleUrls: ['./knowledgebase-line.component.scss']
})
export class KnowledgebaseLineComponent implements OnInit {
  @Input() base: KnowledgeBase;
  @Output() changed = new EventEmitter<any>();
  @Output() duplicated = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<any>();
  nbEntries = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalsService: ModalsService,
    private knowledgesService: KnowledgesService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    if (!this.base.is_example) {
      this.knowledgesService
        .getEntries(this.base.id)
        .then((result: Knowledge[]) => {
          this.nbEntries = result.length;
        })
        .catch(err => {
          console.log('catch');
        });
    } else {
      // exemple
      this.nbEntries = piakb.length;
    }
  }

  onFocusOut(attribute: string, event: any): void {
    const text = event.target.innerText;
    this.base[attribute] = text;
    this.base.update();
    this.changed.emit();
  }

  remove(id): void {
    // this.knowledgesService.selected = id;
    // this.modalsService.openModal('modal-remove-knowledgebase');
    this.confirmDialogService.confirmThis({
      text: 'modals.knowledges.content',
      yes: 'modals.knowledges.remove',
      no: 'modals.cancel'},
      () => {
        this.knowledgesService.remove(id)
          .then(() => {
            this.deleted.emit();
          })
          .catch(() => {
            return;
          });
      },
      () => {
        return;
      });
  }

  export(id): void {
    this.knowledgesService.export(id);
  }

  duplicate(id): void {
    this.knowledgesService.duplicate(id);
    this.duplicated.emit();
  }
}
