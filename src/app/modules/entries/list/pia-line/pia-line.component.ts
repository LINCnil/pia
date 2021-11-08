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

  authorField: Array<TagModelClass> = [];
  validatorField: Array<TagModelClass> = [];
  evaluatorField: Array<TagModelClass> = [];
  guestField: Array<TagModelClass> = [];

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
      // Add tag to tag inputs
      this.authorField.push({
        display: this.pia.author_name,
        id: this.pia.author_name
      });
      this.evaluatorField.push({
        display: this.pia.evaluator_name,
        id: this.pia.evaluator_name
      });
      this.validatorField.push({
        display: this.pia.validator_name,
        id: this.pia.validator_name
      });
      if (this.pia.guests.length > 0) {
        this.pia.guests.forEach((guest: User) => {
          this.guestField.push({
            display:
              guest.firstname && guest.lastname
                ? guest.firstname + ' ' + guest.lastname
                : guest.email,
            id: guest.id
          });
        });
      }
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
  onAddUser($event: TagModelClass, field: string): void {
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

      // waiting for submited user form
      observable.subscribe({
        complete: () => {
          if (userBehavior.value) {
            // user is created
            switch (field) {
              case 'author_name':
                this.authorField = [
                  {
                    display:
                      userBehavior.value.firstname +
                      ' ' +
                      userBehavior.value.lastname,
                    id: userBehavior.value.id
                  }
                ];
                break;
              case 'evaluator_name':
                this.evaluatorField = [
                  {
                    display:
                      userBehavior.value.firstname +
                      ' ' +
                      userBehavior.value.lastname,
                    id: userBehavior.value.id
                  }
                ];
                break;
              case 'validator_name':
                this.validatorField = [
                  {
                    display:
                      userBehavior.value.firstname +
                      ' ' +
                      userBehavior.value.lastname,
                    id: userBehavior.value.id
                  }
                ];
                break;
              case 'guests':
                this.guestField = [
                  {
                    display:
                      userBehavior.value.firstname +
                      ' ' +
                      userBehavior.value.lastname,
                    id: userBehavior.value.id
                  }
                ];
                break;
              default:
                break;
            }
            this.pia[field] = [userBehavior.value.id];
            this.piaService.update(this.pia);
          }
        }
      });
    } else {
      switch (field) {
        case 'author_name':
          this.evaluatorField = [$event];
          this.pia[field] = $event.id;
          break;
        case 'evaluator_name':
          this.evaluatorField = [$event];
          this.pia[field] = $event.id;
          break;
        case 'validator_name':
          this.validatorField = [$event];
          this.pia[field] = $event.id;
          break;
        case 'guests':
          this.pia[field].push($event.id);
          break;
        default:
          break;
      }

      this.pia['guests'] = this.pia['guests'].map(x =>
        typeof x === 'object' ? x.id : x
      );
      this.piaService.update(this.pia);
    }
  }

  onRemove($event: TagModelClass, field: string) {
    const guests: Array<User | number> = this.pia[field];
    const index: number = this.pia[field].findIndex(
      (x: User | number | string) => {
        if (typeof x === 'object') {
          return x.id === $event.id;
        }
        return x === $event.id;
      }
    );
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

  checkIfUserExist(field): boolean {
    switch (field) {
      case 'author_name':
        return this.checkUserInField(this.authorField[0].display);
      case 'evaluator_name':
        return this.checkUserInField(this.evaluatorField[0].display);
      case 'validator_name':
        return this.checkUserInField(this.validatorField[0].display);
      default:
        return false;
    }
  }
}
