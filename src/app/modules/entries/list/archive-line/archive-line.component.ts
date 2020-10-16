import { Component, Input, OnInit } from '@angular/core';
import { Attachment } from 'src/app/models/attachment.model';
import { LanguagesService } from 'src/app/services/languages.service';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-archive-line]',
  templateUrl: './archive-line.component.html',
  styleUrls: ['./archive-line.component.scss']
})
export class ArchiveLineComponent implements OnInit {
  @Input() archivedPia: any;
  attachments: any;

  constructor(
    private modalsService: ModalsService,
    public languagesService: LanguagesService
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
    localStorage.setItem('pia-to-unarchive-id', id);
    this.modalsService.openModal('modal-unarchive-pia');
  }

  /**
   * Open the modal to confirm deletion of an archived PIA
   * @param id - The archived PIA id.
   */
  remove(id: string): void {
    localStorage.setItem('pia-to-remove-id', id);
    this.modalsService.openModal('modal-remove-archived-pia');
  }
}
