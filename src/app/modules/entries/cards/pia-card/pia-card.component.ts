import {
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  Component,
  OnInit,
  OnChanges
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Pia } from 'src/app/models/pia.model';
import { LanguagesService } from 'src/app/services/languages.service';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';

import * as FileSaver from 'file-saver';
import { DialogService } from 'src/app/services/dialog.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { AuthService } from 'src/app/services/auth.service';
import { TagModel, TagModelClass } from 'ngx-chips/core/accessor';
import { User } from 'src/app/models/user.model';
import { SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TagInputComponent } from 'ngx-chips';
declare const require: any;

@Component({
  selector: 'app-pia-card',
  templateUrl: './pia-card.component.html',
  styleUrls: ['./pia-card.component.scss']
})
export class PiaCardComponent implements OnInit, OnChanges {
  @Input() users: Array<User>;
  @Input() pia: Pia;
  @Input() previousPia: any;
  @Output() changed = new EventEmitter<Pia>();
  @Output() duplicated = new EventEmitter<Pia>();
  @Output() archived = new EventEmitter<Pia>();
  @Output() newUserNeeded: EventEmitter<any> = new EventEmitter<any>();

  piaForm: FormGroup;
  attachments: any;
  userList: Array<TagModel> = [];
  addBtnForSpecificInput: {
    display: string;
    pia_id: number;
    field: string;
  } = null;

  @ViewChild('piaName') piaName: ElementRef;
  @ViewChild('piaCategory') piaCategory: ElementRef;
  @ViewChild('piaAuthorName')
  piaAuthorName: ElementRef;
  @ViewChild('piaEvaluatorName')
  piaEvaluatorName: ElementRef;
  @ViewChild('piaValidatorName')
  piaValidatorName: ElementRef;

  @ViewChild('authorTagInput')
  authorTagInput: TagInputComponent;

  constructor(
    public piaService: PiaService,
    private translateService: TranslateService,
    public languagesService: LanguagesService,
    public structureService: StructureService,
    private dialogService: DialogService,
    private attachmentsService: AttachmentsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.piaForm = new FormGroup({
      id: new FormControl(this.pia.id),
      name: new FormControl({ value: this.pia.name, disabled: false }),
      category: new FormControl({ value: this.pia.category, disabled: false }),
      // FOR AUTHENTIFICATE MODE
      authors: new FormControl(
        [],
        [Validators.required, Validators.minLength(1)]
      ),
      evaluators: new FormControl(
        [],
        [Validators.required, Validators.minLength(1)]
      ),
      validators: new FormControl(
        [],
        [Validators.required, Validators.minLength(1)]
      ),
      // FOR NORMAL MODE
      author_name: new FormControl(this.pia.author_name, [
        Validators.required,
        Validators.minLength(1)
      ]),
      evaluator_name: new FormControl(this.pia.evaluator_name, [
        Validators.required,
        Validators.minLength(1)
      ]),
      validator_name: new FormControl(this.pia.validator_name, [
        Validators.required,
        Validators.minLength(1)
      ]),
      guests: new FormControl()
    });

    this.authService.currentUser.subscribe({
      complete: () => {
        if (this.authService.state) {
          // lock tags with users
          this.setFormUsersField(this.pia.user_pias);
        }
      }
    });

    // GET ATTACHMENTS INFOS
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

  private setFormUsersField(user_pias: { user: User; role: String }[]) {
    console.log(user_pias);
    // Use pia.user_pias relation to preselect field
    const authors: { user: User; role: String }[] = user_pias.filter(
      up => up.role == 'author'
    );
    let authors_converted = authors.map(a => {
      return {
        display: a.user.firstname + ' ' + a.user.lastname,
        id: a.user.id
      };
    });
    this.piaForm.controls.authors.setValue(authors_converted);

    const validators = user_pias.filter(up => up.role == 'validator');
    let validators_converted = validators.map(a => {
      return {
        display: a.user.firstname + ' ' + a.user.lastname,
        id: a.user.id
      };
    });
    this.piaForm.controls.validators.setValue(validators_converted);

    const evaluators = user_pias.filter(up => up.role == 'evaluator');
    let evaluators_converted = evaluators.map(a => {
      return {
        display: a.user.firstname + ' ' + a.user.lastname,
        id: a.user.id
      };
    });
    this.piaForm.controls.evaluators.setValue(evaluators_converted);

    const guests = user_pias.filter(up => up.role == 'guest');
    let guests_converted = guests.map(a => {
      return {
        display: a.user.firstname + ' ' + a.user.lastname,
        id: a.user.id
      };
    });
    this.piaForm.controls.guests.setValue(guests_converted);
  }

  get f() {
    return this.piaForm.controls;
  }

  get usersForGuests(): Array<TagModel> {
    let usersForGuests: Array<TagModel> = this.userList;
    const validator: { user: User; role: string } = this.pia.user_pias.find(
      u => u.role === 'validator'
    );
    const evaluator: { user: User; role: string } = this.pia.user_pias.find(
      u => u.role === 'evaluator'
    );
    const author: { user: User; role: string } = this.pia.user_pias.find(
      u => u.role === 'author'
    );

    if (validator) {
      usersForGuests = usersForGuests.filter(
        (x: User) => x.id !== validator.user.id
      );
    }
    if (evaluator) {
      usersForGuests = usersForGuests.filter(
        (x: User) => x.id !== evaluator.user.id
      );
    }
    if (author) {
      usersForGuests = usersForGuests.filter(
        (x: User) => x.id !== author.user.id
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
   * Focus PIA name field.
   */
  piaNameFocusIn(): void {
    this.piaForm.controls['name'].enable();
    this.piaName.nativeElement.focus();
  }

  /**
   * Disabls PIA name field and saves data.
   */

  piaNameFocusOut(): void {
    let userText = this.piaForm.controls['name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.name = this.piaForm.value.name;
      this.piaService.update(this.pia);
      this.changed.emit(this.pia);
    }
  }

  /**
   * Focus PIA author name field.
   */
  piaAuthorNameFocusIn(): void {
    this.piaAuthorName.nativeElement.focus();
  }

  /**
   * Disable PIA author name field and saves data.
   */
  piaAuthorNameFocusOut(): void {
    let userText = this.piaForm.controls['author_name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.author_name = this.piaForm.value.author_name;
      this.piaService.update(this.pia);
      this.changed.emit(this.pia);
    }
  }

  /**
   * Focus PIA evaluator name field.
   */
  piaEvaluatorNameFocusIn(): void {
    this.piaEvaluatorName.nativeElement.focus();
  }

  /**
   * Disable PIA evaluator name field and saves data.
   */
  piaEvaluatorNameFocusOut(): void {
    let userText = this.piaForm.controls['evaluator_name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.evaluator_name = this.piaForm.value.evaluator_name;
      this.piaService.update(this.pia);
      this.changed.emit(this.pia);
    }
  }

  /**
   * Focus PIA validator name field.
   */
  piaValidatorNameFocusIn(): void {
    this.piaValidatorName.nativeElement.focus();
  }

  /**
   * Disable PIA validator name field and saves data.
   */
  piaValidatorNameFocusOut(): void {
    let userText = this.piaForm.value.validator_name;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.validator_name = this.piaForm.value.validator_name;
      this.piaService.update(this.pia);
      this.changed.emit(this.pia);
    }
  }

  /**
   * Focus PIA category field.
   */
  piaCategoryFocusIn(): void {
    this.piaCategory.nativeElement.focus();
  }

  /**
   * Disable PIA category field and saves data.
   */
  piaCategoryFocusOut(): void {
    let userText = this.piaForm.value.category;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.category = this.piaForm.value.category;
      this.piaService.update(this.pia);
      this.changed.emit(this.pia);
    }
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

  onAddUserWithIcon(tag, field) {
    this.onAddUser(tag, field);
    this.piaForm.controls[field].setValue([tag]);
  }

  /**
   * Add user to new Pia Form
   * Update user on author, evaluator and validator
   */
  async onAddUser($event: TagModelClass, field: string): Promise<void> {
    // User selected exist ?
    console.log($event, field);
    const index = this.users.findIndex(u => u.id === $event.id);

    if (index === -1) {
      // USER NOT EXIST:
      // create a behavior for parent composant
      // and observe changements
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
        complete: async () => {
          // Get tag in form
          const tagIndex = this.piaForm.controls[field].value.findIndex(
            f => f.id === $event.display
          );
          if (userBehavior.value) {
            // user is created
            let values = this.piaForm.controls[field].value;
            console.log(userBehavior.value, values);
            values[tagIndex].id = userBehavior.value.id;
            await this.savePiaAfterUserAssign(field);
          } else {
            // Remove tag, because user form is canceled
            this.piaForm.controls[field].value.splice(tagIndex, 1);
          }
        }
      });
    } else {
      await this.savePiaAfterUserAssign(field);
    }
  }

  async savePiaAfterUserAssign(field: string): Promise<any> {
    console.log(field, this.piaForm.controls[field].value);
    const piaCloned = { ...this.pia };
    piaCloned[field] = this.piaForm.controls[field].value.map(x => x.id);

    await this.piaService.update(piaCloned).then((resp: Pia) => {
      this.pia = resp;
      this.setFormUsersField(resp.user_pias);
    });
  }

  onRemove($event: TagModelClass, field: string) {
    this.pia[field] = this.piaForm.controls[field].value.map(x => x.id);
    this.piaService.update(this.pia);
  }

  checkIfUserExist(field): boolean {
    return (
      this.pia.user_pias.findIndex(
        u =>
          u.user.firstname + ' ' + u.user.lastname ===
          this.piaForm.controls[field].value[0].display
      ) !== -1
    );
  }
}
