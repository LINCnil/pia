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
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
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
  @Output() newUserNeeded = new EventEmitter<any>();
  @Output() conflictDetected = new EventEmitter<{ field: string; err: any }>();

  piaForm: UntypedFormGroup;
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
    this.authService.currentUser.subscribe({
      complete: () => {
        this.piaForm = new UntypedFormGroup(this.normalizeForm());
        // lock tags with users
        if (this.authService.state) {
          this.setUserPiasAsFields(this.pia.user_pias);

          // check current_user rights
          if (
            !this.authService.currentUserValue.access_type.includes(
              'functional'
            ) &&
            this.authService.currentUserValue.access_type != 'local'
          ) {
            this.piaForm.disable();
          }
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

  normalizeForm(): any {
    const formFields = {
      id: new UntypedFormControl(this.pia.id),
      name: new UntypedFormControl({ value: this.pia.name, disabled: false }),
      category: new UntypedFormControl({
        value: this.pia.category,
        disabled: false
      })
    };
    if (this.authService.state) {
      [
        { field: 'authors', required: true },
        { field: 'evaluators', required: true },
        { field: 'validators', required: true },
        { field: 'guests', required: false }
      ].forEach(ob => {
        formFields[ob.field] = new UntypedFormControl(
          [],
          ob.required ? [Validators.required, Validators.minLength(1)] : []
        );
      });
    } else {
      ['author_name', 'evaluator_name', 'validator_name'].forEach(field => {
        formFields[field] = new UntypedFormControl(
          this.pia[field],
          Validators.required
        );
      });
    }
    return formFields;
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
      const tags = filteredUserPias.map(a => {
        let display =
          a.user.firstname && a.user.lastname
            ? a.user.firstname + ' ' + a.user.lastname
            : a.user.email;
        return {
          display,
          id: a.user.id
        };
      });

      // user was deleted but present in the dump_field ?
      if (ob.dump_field && this.pia[ob.dump_field]) {
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
      this.piaForm.controls[ob.field].setValue(tags);
    });
  }

  get f() {
    return this.piaForm.controls;
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
   * Focus PIA name field.
   */
  piaNameFocusIn(): void {
    // this.piaForm.controls['name'].enable();
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
      this.piaService
        .update(this.pia)
        .then((pia: Pia) => {
          this.pia = pia;
          this.changed.emit(this.pia);
        })
        .catch(err => {
          if (err.statusText === 'Conflict') {
            this.conflictDetected.emit({ field: 'name', err });
          }
        });
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
      this.piaService
        .update(this.pia)
        .then((pia: Pia) => {
          this.pia = pia;
          this.changed.emit(this.pia);
        })
        .catch(err => {
          if (err.statusText === 'Conflict') {
            this.conflictDetected.emit({ field: 'author_name', err });
          }
        });
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
      this.piaService
        .update(this.pia)
        .then((pia: Pia) => {
          this.pia = pia;
          this.changed.emit(this.pia);
        })
        .catch(err => {
          if (err.statusText === 'Conflict') {
            this.conflictDetected.emit({ field: 'evaluator_name', err });
          }
        });
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
      this.piaService
        .update(this.pia)
        .then((pia: Pia) => {
          this.pia = pia;
          this.changed.emit(this.pia);
        })
        .catch(err => {
          if (err.statusText === 'Conflict') {
            this.conflictDetected.emit({ field: 'validator_name', err });
          }
        });
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
      this.piaService
        .update(this.pia)
        .then((pia: Pia) => {
          this.pia = pia;
          this.changed.emit(this.pia);
        })
        .catch(err => {});
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

  onAddUserWithIcon(tag, field): void {
    this.onAddUser(tag, field);
    this.piaForm.controls[field].setValue([tag]);
  }

  /**
   * Add user to new Pia Form
   * Update user on author, evaluator and validator
   */
  async onAddUser($event: TagModelClass, field: string): Promise<void> {
    // User selected exist ?
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

      // waiting for submitted user form
      observable.subscribe({
        complete: async () => {
          // Get tag in form
          const tagIndex = this.piaForm.controls[field].value.findIndex(
            f => f.id === $event.display
          );
          if (userBehavior.value) {
            // user is created
            let values = this.piaForm.controls[field].value;
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

  /**
   * Main method to save users role field
   */
  async savePiaAfterUserAssign(field: string): Promise<any> {
    if (this.piaForm.controls[field].hasError('required')) {
      return;
    }
    const piaCloned = { ...this.pia };
    const userAssignValues = this.piaForm.controls[field].value.map(x =>
      x.id ? x.id : x.display
    );
    piaCloned[field] = userAssignValues;

    await this.piaService
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

  onRemove($event: TagModelClass, field: string): void {
    this.savePiaAfterUserAssign(field);
  }
}
