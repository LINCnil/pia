import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ArchiveService } from 'src/app/services/archive.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { PiaService } from 'src/app/services/pia.service';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faRefresh } from '@fortawesome/free-solid-svg-icons/faRefresh';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-archive-line]',
  templateUrl: './archive-line.component.html',
  styleUrls: ['./archive-line.component.scss'],
  standalone: false
})
export class ArchiveLineComponent implements OnInit {
  @Input() archivedPia: any;
  @Output() deleted = new EventEmitter<any>();
  attachments: any;

  protected readonly faEye = faEye;
  protected readonly faRefresh = faRefresh;
  protected readonly faTrash = faTrash;

  constructor(
    public piaService: PiaService,
    public languagesService: LanguagesService,
    public archiveService: ArchiveService,
    private dialogService: DialogService,
    private attachmentsService: AttachmentsService
  ) {}

  ngOnInit(): void {
    this.attachments = [];
    this.attachmentsService.pia_id = this.archivedPia.id;
    this.attachmentsService
      .findAllByPia(this.archivedPia.id)
      .then((entries: any) => {
        entries.forEach(element => {
          if (element['file'] && element['file'].length) {
            this.attachments.push(element);
          }
        });
      });
  }

  /**
   * Unarchive an archived PIA with a given id.
   * @param id - The archived PIA id.
   */
  unarchive(id: string): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.unarchive_pia.content',
        type: 'confirm',
        yes: 'modals.unarchive_pia.unarchive',
        no: 'modals.cancel',
        data: {
          btn_no: 'btn-blue',
          btn_yes: 'btn-blue'
        }
      },
      () => {
        this.archiveService
          .unarchive(id)
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

  /**
   * Open the modal to confirm deletion of an archived PIA
   * @param id - The archived PIA id.
   */
  remove(id: string): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.remove_pia.content',
        type: 'confirm',
        yes: 'modals.remove_pia.remove',
        no: 'modals.cancel',
        icon: 'pia-icons pia-icon-sad',
        data: {
          btn_yes: 'btn-red'
        }
      },
      () => {
        this.archiveService
          .remove(id)
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
}
