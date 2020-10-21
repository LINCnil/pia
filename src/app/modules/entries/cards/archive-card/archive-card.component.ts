import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Attachment } from 'src/app/models/attachment.model';
import { ArchiveService } from 'src/app/services/archive.service';
import { ConfirmDialogService } from 'src/app/services/confirm-dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  selector: 'app-archive-card',
  templateUrl: './archive-card.component.html',
  styleUrls: ['./archive-card.component.scss']
})
export class ArchiveCardComponent implements OnInit {
  @Input() archivedPia: any;
  @Input() previousArchivedPia: any;
  @Output() deleted = new EventEmitter<any>();
  attachments: any;

  constructor(
    public languagesService: LanguagesService,
    public archiveService: ArchiveService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    const attachmentModel = new Attachment();
    this.attachments = [];
    attachmentModel.pia_id = this.archivedPia.id;
    attachmentModel.findAll().then((entries: any) => {
      entries.forEach(element => {
        if (element['file'] && element['file'].length) {
          this.attachments.push(element);
        }
      });
    });
  }

  /**
   * Unarchive an archived PIA with a given id.
   * @param {string} id - The archived PIA id.
   */
  unarchive(id: string): void {
    this.confirmDialogService.confirmThis({
      text: 'modals.unarchive_pia.content',
      yes: 'modals.unarchive_pia.unarchive',
      no: 'modals.cancel'},
      () => {
        this.archiveService.unarchive(id)
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

  /**
   * Delete an archived PIA with a given id.
   * @param {string} id - The archived PIA id.
   */
  remove(id: string): void {
    this.confirmDialogService.confirmThis({
      text: 'modals.remove_pia.content',
      yes: 'modals.remove_pia.remove',
      no: 'modals.cancel'},
      () => {
        this.archiveService.remove(id)
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

}
