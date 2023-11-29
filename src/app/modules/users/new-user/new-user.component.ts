import {
  Component,
  OnInit,
  Output,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { EventEmitter } from '@angular/core';

import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class NewUserComponent implements OnInit, OnChanges {
  @Input() forceUserType = false;
  public userForm: UntypedFormGroup;
  public loading = false;
  @Input() user = null;
  @Output() userAdded: EventEmitter<any> = new EventEmitter<any>();
  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();
  msgFromBack: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    public usersService: UsersService
  ) {
    // INIT FORM
    this.userForm = this.formBuilder.group({
      lastname: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      email: ['', [Validators.required]],
      access_type: [[], Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    if (changes.user.currentValue) {
      this.userForm.patchValue({
        lastname: changes.user.currentValue.lastname
      });
      this.userForm.patchValue({
        firstname: changes.user.currentValue.firstname
      });
      this.userForm.patchValue({ email: changes.user.currentValue.email });
      this.userForm.patchValue({
        access_type: changes.user.currentValue.access_type
      });
    }
  }

  ngOnInit(): void {}

  get f() {
    return this.userForm.controls;
  }

  onSubmit(): void {
    this.loading = true;
    this.usersService
      .editUser(this.user ? this.user.id : null, this.userForm.value)
      .then(response => {
        this.loading = false;
        this.userAdded.emit(response);
      })
      .catch(err => {
        this.loading = false;
        this.msgFromBack = err.status;
        console.log(err);
      });
  }

  setProfil($event): void {
    if ($event.target.checked) {
      this.userForm.patchValue({ access_type: $event.target.value });
      switch ($event.target.value) {
        case 'technical':
          this.userForm.patchValue({
            access_type: ['technical', 'functional', 'user']
          });
          break;
        case 'functional':
          this.userForm.patchValue({ access_type: ['functional', 'user'] });
          break;
        case 'user':
          this.userForm.patchValue({ access_type: ['user'] });
          break;
        default:
          break;
      }
    } else {
      const index = this.userForm.controls.access_type.value.findIndex(
        e => e === $event.target.value
      );
      if (index !== -1) {
        this.userForm.controls.access_type.value.splice(index, 1);
        this.userForm.patchValue({
          access_type: this.userForm.controls.access_type.value
        });
      }
    }
  }
}
