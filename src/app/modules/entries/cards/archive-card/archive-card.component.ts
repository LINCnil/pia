import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ArchiveService } from 'src/app/services/archive.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { PiaService } from 'src/app/services/pia.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

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
  piaForm: UntypedFormGroup;

  constructor(
    public languagesService: LanguagesService,
    public archiveService: ArchiveService,
    private dialogService: DialogService,
    public piaService: PiaService,
    private attachmentsService: AttachmentsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.piaForm = new UntypedFormGroup({
      author_name: new UntypedFormControl(),
      evaluator_name: new UntypedFormControl(),
      validator_name: new UntypedFormControl(),
      guests: new UntypedFormControl()
    });

    this.piaForm.controls.author_name.setValue([
      { display: this.archivedPia.author_name }
    ]);
    this.piaForm.controls.evaluator_name.setValue([
      { display: this.archivedPia.evaluator_name }
    ]);
    this.piaForm.controls.validator_name.setValue([
      { display: this.archivedPia.validator_name }
    ]);
    if (this.archivedPia.guests) {
      this.piaForm.controls.guests.setValue(
        this.archivedPia.guests.map(x => {
          return { display: x.firstname + x.lastname, id: x.id };
        })
      );
    }

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
   * @param {string} id - The archived PIA id.
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
   * Delete an archived PIA with a given id.
   * @param {string} id - The archived PIA id.
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
