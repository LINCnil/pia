import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Attachment } from 'src/app/models/attachment.model';
import { ArchiveService } from 'src/app/services/archive.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-archive-line]',
  templateUrl: './archive-line.component.html',
  styleUrls: ['./archive-line.component.scss']
})
export class ArchiveLineComponent implements OnInit {
  @Input() archivedPia: any;
  @Output() deleted = new EventEmitter<any>();
  attachments: any;

  constructor(
    public languagesService: LanguagesService,
    public archiveService: ArchiveService,
    private dialogService: DialogService
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
   * @param id - The archived PIA id.
   */
  unarchive(id: string): void {
    this.dialogService.confirmThis({
      text: 'modals.unarchive_pia.content',
      type: 'confirm',
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
   * Open the modal to confirm deletion of an archived PIA
   * @param id - The archived PIA id.
   */
  remove(id: string): void {
    this.dialogService.confirmThis({
      text: 'modals.remove_pia.content',
      type: 'confirm',
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
