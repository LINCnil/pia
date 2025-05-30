import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { DialogService } from 'src/app/services/dialog.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import piakb from 'src/assets/files/pia_knowledge-base.json';
import {
  faPencil,
  faEye,
  faDownload,
  faFile,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-knowledgebase-line]',
  templateUrl: './knowledgebase-line.component.html',
  styleUrls: ['./knowledgebase-line.component.scss'],
  standalone: false
})
export class KnowledgebaseLineComponent implements OnInit {
  @Input() base: KnowledgeBase;
  @Output() changed = new EventEmitter<any>();
  @Output() duplicated = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<any>();
  @Output() conflictDetected = new EventEmitter<{ field: string; err: any }>();
  nbEntries = 0;

  protected readonly faPencil = faPencil;
  protected readonly faEye = faEye;
  protected readonly faDownload = faDownload;
  protected readonly faFile = faFile;
  protected readonly faTrash = faTrash;

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
      .then(response => {
        this.base = response;
        this.changed.emit(this.base);
      })
      .catch(err => {
        if (err.statusText === 'Conflict') {
          this.conflictDetected.emit({ field: attribute, err });
        }
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
