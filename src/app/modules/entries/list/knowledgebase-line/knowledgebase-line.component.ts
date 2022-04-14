import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { DialogService } from 'src/app/services/dialog.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';
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
    private knowledgesService: KnowledgesService,
    private knowledgeBaseService: KnowledgeBaseService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    if (!this.base.is_example) {
      this.knowledgesService
        .getEntries(this.base.id)
        .then((result: Knowledge[]) => {
          this.nbEntries = result.length;
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      // example
      this.nbEntries = piakb.length;
    }
  }

  onFocusOut(attribute: string, event: any): void {
    const text = event.target.innerText;
    this.base[attribute] = text;
    this.knowledgeBaseService
      .update(this.base)
      .then(() => {
        this.changed.emit(this.base);
      })
      .catch(err => {
        console.error(err);
      });
  }

  remove(id): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.knowledges.content',
        type: 'confirm',
        yes: 'modals.knowledges.remove',
        no: 'modals.cancel',
        icon: 'pia-icons pia-icon-sad',
        data: {
          btn_yes: 'btn-red'
        }
      },
      () => {
        this.knowledgeBaseService
          .delete(id)
          .then(() => {
            this.deleted.emit();
          })
          .catch(() => {
            return;
          });
      },
      () => {
        return;
      }
    );
  }

  export(id): void {
    this.knowledgeBaseService.export(id);
  }

  duplicate(id): void {
    this.knowledgeBaseService.duplicate(id);
    this.duplicated.emit();
  }
}
