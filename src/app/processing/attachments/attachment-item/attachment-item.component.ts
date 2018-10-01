import { Component, Input } from '@angular/core';
import { ModalsService } from '../../../modals/modals.service';
import { ProcessingModel, ProcessingAttachmentModel } from '@api/models';
import { ProcessingAttachmentApi } from '@api/services';

@Component({
  selector: 'app-processing-attachment-item',
  templateUrl: './attachment-item.component.html',
  styleUrls: ['./attachment-item.component.scss']
})
export class AttachmentItemComponent {

  @Input() attachment: ProcessingAttachmentModel;
  @Input() processing: ProcessingModel;

  constructor(private _modalsService: ModalsService) { }

  /**
   * Deletes an attachment with a given id.
   * @param {string} id - Unique id of the attachment to be deleted.
   * @memberof AttachmentItemComponent
   */
  removeAttachment(id: string) {
    localStorage.setItem('attachment-id', id);
    this._modalsService.openModal('modal-remove-processing-attachment');
  }
}
