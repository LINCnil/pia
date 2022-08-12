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
      this.setUserPiasAsFields(this.pia.user_pias);
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
   * Convert user_pias datas into fields for the form
   */
  setUserPiasAsFields(user_pias: { user: User; role: String }[]) {
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
      let tags = filteredUserPias.map(a => {
        return {
          display: a.user.firstname + ' ' + a.user.lastname,
          id: a.user.id
        };
      });

      // user was deleted but present in the dump_field ?
      if (ob.dump_field) {
        const fullnames = this.pia[ob.dump_field].split(',');
        fullnames.forEach(fullname => {
          // present in tags ?
          const exist = tags.find(ac => ac.display == fullname);
          if (!exist) {
            // add to tag
            tags.push({ display: fullname, id: null });
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
  get usersForGuests(): Array<TagModel> {
    let usersForGuests: Array<TagModel> = this.userList;
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
      this.setUserPiasAsFields(resp.user_pias);
    });
  }

  onRemove($event: TagModelClass, field: string) {
    const tags: Array<User | number> = this[field];
    const index: number = this[field].findIndex((x: User | number | string) => {
      if (typeof x === 'object') {
        return x.id === $event.id;
      }
      return x === $event.id;
    });
    if (index !== -1) {
      tags.splice(index, 1);
    }

    this.pia[field] = tags.map(x => (typeof x === 'object' ? x.id : x));
    this.piaService.update(this.pia);
  }

  private checkUserInField(field) {
    return (
      this.pia.user_pias.findIndex(
        u => u.user.firstname + ' ' + u.user.lastname === field
      ) !== -1
    );
  }
}
