import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { TagModel, TagModelClass } from 'ngx-chips/core/accessor';
import { BehaviorSubject } from 'rxjs';
import { Pia } from 'src/app/models/pia.model';
import { Structure } from 'src/app/models/structure.model';
import { User } from 'src/app/models/user.model';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';
import { AuthService } from 'src/app/services/auth.service';
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-new-pia',
  templateUrl: './new-pia.component.html',
  styleUrls: ['../form.component.scss']
})
export class NewPiaComponent implements OnInit {
  @Input() users: Array<User>;
  userList: Array<TagModel>;
  @Output() newUserNeeded: EventEmitter<any> = new EventEmitter<any>();
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();
  piaForm: UntypedFormGroup;
  structureList: Array<Structure> = [];

  constructor(
    private piaService: PiaService,
    public structureService: StructureService,
    public authService: AuthService
  ) {
    this.authService.currentUser.subscribe({
      complete: () => {
        // GET STRUCTURE LIST
        this.structureService
          .getAll()
          .then((response: Array<Structure>) => {
            this.structureList = response;
          })
          .catch(err => {
            console.error(err);
          });
      }
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe({
      complete: () => {
        this.piaForm = new UntypedFormGroup(this.normalizeForm());
      }
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

  /**
   * Disable the already selected users in the guests field
   */
  get usersForGuests(): Array<any> {
    const res = [];

    if (this.piaForm) {
      this.userList.forEach((u: any) => {
        if (this.piaForm) {
          let presence = false;
          for (const role of ['authors', 'evaluators', 'validators']) {
            if (
              this.piaForm.controls[role].value.map(x => x.id).includes(u.id)
            ) {
              presence = true;
            }
          }
          if (!presence) {
            res.push(u);
          }
        }
      });
    }

    return res;
  }

  normalizeForm(): any {
    const formFields = {
      name: new UntypedFormControl(),
      category: new UntypedFormControl(),
      structure_id: new UntypedFormControl()
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
        formFields[field] = new UntypedFormControl('', Validators.required);
      });
    }
    return formFields;
  }

  /**
   * Add user to new Pia Form
   */
  onAddUser($event: TagModelClass, field: string): void {
    // Get tag in form
    const tagIndex = this.piaForm.controls[field].value.findIndex(
      f => f.id === $event.display
    );

    // Open form
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

      this.newUserNeeded.emit(userBehavior); // open form
      observable.subscribe({
        complete: () => {
          if (userBehavior.value) {
            // Update tag id
            let values = this.piaForm.controls[field].value;
            values[tagIndex].id = userBehavior.value.id;
          } else {
            // Remove tag
            this.piaForm.controls[field].value.splice(tagIndex, 1);
          }
        }
      });
    }
  }

  /**
   * Save the newly created PIA.
   */
  onSubmit(): void {
    let data;
    if (this.authService.state) {
      data = {
        ...this.piaForm.value
      };

      [
        { field: 'authors', role: 'author', dump_field: 'author_name' },
        {
          field: 'evaluators',
          role: 'evaluator',
          dump_field: 'evaluator_name'
        },
        {
          field: 'validators',
          role: 'validator',
          dump_field: 'validator_name'
        },
        { field: 'guests', role: 'guest', dump_field: null }
      ].forEach(ob => {
        data[ob.field] = this.piaForm.controls[ob.field].value.map(x => x.id);
      });
    } else {
      data = { ...this.piaForm.value };
    }

    this.piaService.saveNewPia(data).then((result: Pia) => {
      this.submitted.emit(result.id);
    });
  }
}
