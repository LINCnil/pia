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
import { FormGroup } from '@angular/forms';

import * as FileSaver from 'file-saver';
import { DialogService } from 'src/app/services/dialog.service';
import { AttachmentsService } from 'src/app/services/attachments.service';

import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import { TagModel, TagModelClass } from 'ngx-chips/core/accessor';
import { BehaviorSubject } from 'rxjs';
declare const require: any;

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[app-pia-line]',
  templateUrl: './pia-line.component.html',
  styleUrls: ['./pia-line.component.scss']
})
export class PiaLineComponent implements OnInit, OnChanges {
  @Input() pia: Pia;
  @Output() changed = new EventEmitter<Pia>();
  @Output() duplicated = new EventEmitter<Pia>();
  @Output() archived = new EventEmitter<Pia>();
  @Output() newUserNeeded: EventEmitter<any> = new EventEmitter<any>();
  @Input() users: Array<User>;

  piaForm: FormGroup;
  userList: Array<TagModel> = [];
  attachments: any;

  authors: Array<TagModelClass> = [];
  validators: Array<TagModelClass> = [];
  evaluators: Array<TagModelClass> = [];
  guests: Array<TagModelClass> = [];
  addBtnForSpecificInput: {
    display: string;
    pia_id: number;
    field: string;
  } = null;

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
      // Use pia.user_pias relation to preselect field
      const authors_pias: {
        user: User;
        role: String;
      }[] = this.pia.user_pias.filter(up => up.role == 'author');
      this.authors = authors_pias.map(a => {
        return {
          display: a.user.firstname + ' ' + a.user.lastname,
          id: a.user.id
        };
      });

      const validators_pias: {
        user: User;
        role: String;
      }[] = this.pia.user_pias.filter(up => up.role == 'validator');
      this.validators = validators_pias.map(a => {
        return {
          display: a.user.firstname + ' ' + a.user.lastname,
          id: a.user.id
        };
      });

      const evaluators_pias: {
        user: User;
        role: String;
      }[] = this.pia.user_pias.filter(up => up.role == 'evaluator');
      this.evaluators = evaluators_pias.map(a => {
        return {
          display: a.user.firstname + ' ' + a.user.lastname,
          id: a.user.id
        };
      });

      const guests_pias: {
        user: User;
        role: String;
      }[] = this.pia.user_pias.filter(up => up.role == 'guest');
      this.guests = guests_pias.map(a => {
        return {
          display: a.user.firstname + ' ' + a.user.lastname,
          id: a.user.id
        };
      });
    }

    this.attachments = [];
    this.attachmentsService.pia_id = this.pia.id;
    this.attachmentsService.findAllByPia(this.pia.id).then((entries: any) => {
      entries.forEach(element => {
        if (element['file'] && element['file'].length) {
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

  onTyped($event, pia_id, field) {
    if ($event != '') {
      this.addBtnForSpecificInput = {
        display: $event,
        pia_id: pia_id,
        field: field
      };
    } else {
      this.addBtnForSpecificInput = null;
    }
  }

  /**
   * Disable the already selected users in the guests field
   */
  get usersForGuests(): Array<TagModel> {
    let usersForGuests: Array<TagModel> = this.userList;
    const validators: {
      user: User;
      role: string;
    }[] = this.pia.user_pias.filter(u => u.role === 'validator');
    const evaluators: {
      user: User;
      role: string;
    }[] = this.pia.user_pias.filter(u => u.role === 'evaluator');
    const authors: { user: User; role: string }[] = this.pia.user_pias.filter(
      u => u.role === 'author'
    );

    if (validators) {
      usersForGuests = usersForGuests.filter(
        (x: User) => !validators.map(vs => vs.user.id).includes(x.id)
      );
    }
    if (evaluators) {
      usersForGuests = usersForGuests.filter(
        (x: User) => !evaluators.map(es => es.user.id).includes(x.id)
      );
    }
    if (authors) {
      usersForGuests = usersForGuests.filter(
        (x: User) => !authors.map(as => as.user.id).includes(x.id)
      );
    }
    return usersForGuests;
  }

  /**
   * Generate a ZIP with the attachments and the .json
   */
  async generateZip(): Promise<void> {
    setTimeout(() => {
      const JSZip = require('jszip');
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
        const byteCharacters1 = atob((attachment.file as any).split(',')[1]);
        const folderName = this.translateService.instant('summary.attachments');
        zip.file(folderName + '/' + attachment.name, byteCharacters1, {
          binary: true
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
    this.piaService.update(this.pia);
    this.changed.emit(this.pia);
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
  async onAddUser($event: TagModelClass, field: string): Promise<void> {
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
        complete: () => {
          if (userBehavior.value) {
            // user is created
            this[field] = [
              {
                display:
                  userBehavior.value.firstname +
                  ' ' +
                  userBehavior.value.lastname,
                id: userBehavior.value.id
              }
            ];
            this.pia[field] = [userBehavior.value.id];
            this.piaService.update(this.pia).then(async (resp: Pia) => {
              await this.savePiaAfterUserAssign(field);
            });
          }
        }
      });
    } else {
      this[field].push($event);
      await this.savePiaAfterUserAssign(field);
    }
  }

  async savePiaAfterUserAssign(field: string): Promise<any> {
    const piaCloned = { ...this.pia };
    piaCloned[field] = this[field].map(x => x.id);
    this.piaService.update(piaCloned).then((resp: Pia) => {
      // this.pia = resp;
    });
  }

  onRemove($event: TagModelClass, field: string) {
    const guests: Array<User | number> = this[field];
    const index: number = this[field].findIndex((x: User | number | string) => {
      if (typeof x === 'object') {
        return x.id === $event.id;
      }
      return x === $event.id;
    });
    if (index !== -1) {
      guests.splice(index, 1);
    }

    this.pia[field] = guests.map(x => (typeof x === 'object' ? x.id : x));
    this.piaService.update(this.pia);
  }

  private checkUserInField(field) {
    return (
      this.pia.user_pias.findIndex(
        u => u.user.firstname + ' ' + u.user.lastname === field
      ) !== -1
    );
  }

  checkIfUserExist(field, item): boolean {
    return true;
  }
}
