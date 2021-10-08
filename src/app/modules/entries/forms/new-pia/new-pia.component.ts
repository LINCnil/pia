import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  piaForm: FormGroup;
  structureList: Array<Structure> = [];

  constructor(
    private piaService: PiaService,
    public structureService: StructureService,
    public authService: AuthService
  ) {
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

  ngOnInit(): void {
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(null, [
        Validators.required,
        Validators.minLength(1)
      ]),
      evaluator_name: new FormControl(null, [
        Validators.required,
        Validators.minLength(1)
      ]),
      validator_name: new FormControl(null, [
        Validators.required,
        Validators.minLength(1)
      ]),
      guests: new FormControl(),
      category: new FormControl(),
      structure_id: new FormControl()
    });
  }

  /**
   * Add user to new Pia Form
   */
  onAddUser($event: TagModelClass, field: string) {
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
        ...this.piaForm.value,
        guests: this.piaForm.controls.guests.value
          ? this.piaForm.controls.guests.value.map(x => x.id)
          : [],
        validator_name: this.piaForm.controls.validator_name.value.map(
          x => x.id
        ),
        evaluator_name: this.piaForm.controls.evaluator_name.value.map(
          x => x.id
        ),
        author_name: this.piaForm.controls.author_name.value.map(x => x.id)
      };
    } else {
      data = { ...this.piaForm.value };
    }

    this.piaService.saveNewPia(data).then((result: Pia) => {
      this.submitted.emit(result.id);
    });
  }
}
