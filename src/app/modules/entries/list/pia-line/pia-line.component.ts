import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Pia } from 'src/app/models/pia.model';
import { LanguagesService } from 'src/app/services/languages.service';
import { PiaService } from 'src/app/services/pia.service';

import * as FileSaver from 'file-saver';
import { DialogService } from 'src/app/services/dialog.service';
import { AttachmentsService } from 'src/app/services/attachments.service';

import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import { BehaviorSubject } from 'rxjs';
import {
  faPencil,
  faEye,
  faFile,
  faDownload,
  faArchive
} from '@fortawesome/free-solid-svg-icons';
import JSZip from 'jszip';
declare const require: any;

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-pia-line]',
  templateUrl: './pia-line.component.html',
  styleUrls: ['./pia-line.component.scss'],
  standalone: false
})
export class PiaLineComponent implements OnInit, OnChanges {
  @Input() pia: Pia;
  @Output() changed = new EventEmitter<Pia>();
  @Output() duplicated = new EventEmitter<Pia>();
  @Output() archived = new EventEmitter<Pia>();
  @Output() newUserNeeded: EventEmitter<any> = new EventEmitter<any>();
  @Output() conflictDetected = new EventEmitter<{ field: string; err: any }>();
  @Input() users: Array<User>;

  userList: Array<any> = [];
  attachments: any;

  authors: Array<any> = [];
  validators: Array<any> = [];
  evaluators: Array<any> = [];
  guests: Array<any> = [];
  addBtnForSpecificInput: {
    display: string;
    pia_id: number;
    field: string;
  } = null;

  protected readonly faPencil = faPencil;
  protected readonly faEye = faEye;
  protected readonly faFile = faFile;
  protected readonly faDownload = faDownload;
  protected readonly faArchive = faArchive;

  constructor(
    public piaService: PiaService,
    private translateService: TranslateService,
    public languagesService: LanguagesService,
    private dialogService: DialogService,
    private attachmentsService: AttachmentsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.state) {
      this.setUserPiasAsFields(this.pia.user_pias);
    }

    this.attachments = [];
    this.attachmentsService.pia_id = this.pia.id;
    this.attachmentsService.findAllByPia(this.pia.id).then((entries: any) => {
      entries.forEach(element => {
        if (element['file']) {
          this.attachments.push(element);
        }
      });
    });
  }

  // TO CHANGE USERS INTO USER TAG LIST
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.users && changes.users.currentValue) {
      this.userList = changes.users.currentValue.map(x => {
        return {
          display:
            x.firstname && x.lastname
              ? x.firstname + ' ' + x.lastname
              : x.email,
          id: x.id
        };
      });
    }
  }

  onTyped($event, pia_id, field): void {
    if ($event != '') {
      this.addBtnForSpecificInput = {
        display: $event,
        pia_id,
        field
      };
    } else {
      this.addBtnForSpecificInput = null;
    }
  }

  isInputDisabled(): boolean {
    return (this.authService.currentUserValue &&
      !this.authService.currentUserValue.access_type.includes('functional'));
  }

  /**
   * Convert user_pias datas into fields for the form
   */
  setUserPiasAsFields(user_pias: { user: User; role: String }[]): void {
    [
      { field: 'authors', role: 'author', dump_field: 'author_name' },
      { field: 'evaluators', role: 'evaluator', dump_field: 'evaluator_name' },
      { field: 'validators', role: 'validator', dump_field: 'validator_name' },
      { field: 'guests', role: 'guest', dump_field: null }
    ].forEach(ob => {
      // get user_pias with role
      const filteredUserPias: { user: User; role: String }[] = user_pias.filter(
        up => up.role == ob.role
      );

      // convert as tag
      const tags = filteredUserPias.map(a => {
        const display =
          a.user.firstname && a.user.lastname
            ? a.user.firstname + ' ' + a.user.lastname
            : a.user.email;
        return {
          display,
          id: a.user.id
        };
      });

      // user was deleted but present in the dump_field ?
      if (ob.dump_field) {
        const fullnames = this.pia[ob.dump_field].split(',');
        fullnames.forEach(fullname => {
          // present in tags ?
          const exist = tags.find(ac => ac.display == fullname);
          if (!exist && fullname != '') {
            // add to tag
            tags.push({ display: fullname, id: null }); // id = null is for deleted user but dumped
          }
        });
      }

      // save tags
      this[ob.field] = tags;
    });
  }

  /**
   * Disable the already selected users in the guests field
   */
  get usersForGuests(): Array<any> {
    let usersForGuests: Array<any> = this.userList;
    [
      { field: 'authors', role: 'author', dump_field: 'author_name' },
      { field: 'evaluators', role: 'evaluator', dump_field: 'evaluator_name' },
      { field: 'validators', role: 'validator', dump_field: 'validator_name' }
    ].forEach(ob => {
      const users: { user: User; role: string }[] = this.pia.user_pias.filter(
        u => u.role === ob.role
      );
      if (users) {
        usersForGuests = usersForGuests.filter(
          (x: User) => !users.map(as => as.user.id).includes(x.id)
        );
      }
    });
    return usersForGuests;
  }

  /**
   * Generate a ZIP with the attachments and the .json
   */
  async generateZip(): Promise<void> {
    setTimeout(() => {
      const zip = new JSZip();
      /* Attachments */
      this.addAttachmentsToZip(zip).then((zip2: any) => {
        /* JSON */
        this.piaService.export(this.pia.id).then((data: any) => {
          zip2.file('pia.json', data, { binary: true });
          /* Save as .zip */
          zip2.generateAsync({ type: 'blob' }).then(blobContent => {
            FileSaver.saveAs(blobContent, 'pia-' + this.pia.name + '.zip');
          });
        });
      });
    }, 500);
  }

  /**
   * Add all active attachments (not the removed ones) to the zip after converting them as blob files
   * @param zip zip
   */
  async addAttachmentsToZip(zip): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.attachments.forEach(attachment => {
        const folderName = this.translateService.instant('summary.attachments');

        const isFileUrl = typeof attachment.file === 'string' &&
          (attachment.file.startsWith('http') || attachment.file.startsWith('/'));

        let localUrl: string;
        if (!isFileUrl) {
          const blob = new Blob([attachment.file], { type: attachment.mime_type });
          localUrl = URL.createObjectURL(blob);
        } else {
          localUrl = attachment.file;
        }

        fetch(localUrl)       // 1) fetch the url
          .then(response => {                       // 2) filter on 200 OK
            if (response.status === 200 || response.status === 0) {
              zip.file(folderName + '/' + attachment.name, response.blob(), {
                binary: true
              });
            }
          });
      });
      resolve(zip);
    });
  }

  /**
   * Focus out field and update PIA.
   * @param attribute - Attribute of the PIA.
   * @param event - Any Event.
   */
  onFocusOut(attribute: string, event: any): void {
    const text = event.target.innerText;
    this.pia[attribute] = text;
    this.piaService
      .update(this.pia)
      .then((pia: Pia) => {
        this.pia = pia;
        this.changed.emit(this.pia);
      })
      .catch(err => {
        if (err.statusText === 'Conflict') {
          this.conflictDetected.emit({ field: attribute, err });
        }
      });
  }

  /**
   * Archive a PIA with a given id
   * @param id - The PIA id
   */
  archivePia(id: number): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.archive_pia.content',
        type: 'confirm',
        yes: 'modals.archive_pia.archive',
        no: 'modals.cancel',
        data: {
          btn_no: 'btn-blue',
          btn_yes: 'btn-blue'
        }
      },
      () => {
        this.piaService
          .archive(id)
          .then(() => {
            this.archived.emit();
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
   * Click on duplicate, clone the pia
   */
  onDuplicate(id): any {
    this.piaService.duplicate(id).then(() => {
      this.duplicated.emit(id);
    });
  }

  /**
   * Add user to new Pia Form
   * Update user on author, evaluator and validator
   */
  async onAddUser($event: any, field: string): Promise<void> {
    // User selected exist ?
    const index = this.users.findIndex(u => u.id === $event.id);
    if (index === -1) {
      // not exist ->
      const userBehavior: BehaviorSubject<User> = new BehaviorSubject<User>({
        lastname: $event.display.split(' ')[1],
        firstname: $event.display.split(' ')[0],
        access_type: ['user'],
        email: ''
      });
      const observable = userBehavior.asObservable();

      // open form in entries
      this.newUserNeeded.emit(userBehavior);

      // waiting for submitted user form
      observable.subscribe({
        complete: async () => {
          console.log(this[field], $event);
          if (userBehavior.value) {
            this[field].push({
              display: `${userBehavior.value.firstname} ${userBehavior.value.lastname}`,
              id: userBehavior.value.id
            });
            // user is created
            await this.savePiaAfterUserAssign(field);
          } else {
            // Remove tag, because user form is canceled
          }
        }
      });
    } else {
      this[field].push($event);
      await this.savePiaAfterUserAssign(field);
    }
  }

  /**
   * Main method to save users role field
   */
  async savePiaAfterUserAssign(field: string): Promise<any> {
    if (
      ['authors', 'evaluators', 'validators'].includes(field) &&
      this[field].length === 0
    ) {
      return;
    }
    const piaCloned = { ...this.pia };
    const userAssignValues = this[field].map(x => (x.id ? x.id : x.display));
    piaCloned[field] = userAssignValues;
    this.piaService
      .update(piaCloned)
      .then((resp: Pia) => {
        this.pia = resp;
        this.setUserPiasAsFields(resp.user_pias);
      })
      .catch(err => {
        if (err.statusText === 'Conflict') {
          // AUTO FIX
          // this.conflictDetected.emit({ field: 'name', err });
          const piaCloned = err.record;
          piaCloned[field] = userAssignValues;
          this.piaService.update(piaCloned).then((resp: Pia) => {
            this.pia = resp;
            this.setUserPiasAsFields(resp.user_pias);
          });
        }
      });
  }

  onRemove($event: any, field: string): void {
    const index = this[field].findIndex(t => t == $event);
    if (index != -1) {
      this[field].splice(index, 1);
    }
    this.savePiaAfterUserAssign(field);
  }
}
