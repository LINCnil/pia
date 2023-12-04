import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators
} from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-uuid',
  templateUrl: './uuid.component.html',
  styleUrls: ['../form.scss', './uuid.component.scss']
})
export class UuidComponent implements OnInit {
  @Input() reset = false;
  @Output() canceled = new EventEmitter<boolean>();
  @Output() validated = new EventEmitter<boolean | User>();

  loading: boolean = false;
  uuidActivation: UntypedFormGroup;
  uuidRegex = new RegExp(
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  );

  msgFromBack: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    // Prepare uuid form
    this.uuidActivation = this.formBuilder.group({
      uuid: new UntypedFormControl('', [
        Validators.required,
        Validators.pattern(this.uuidRegex)
      ])
    });
  }

  get f() {
    return this.uuidActivation.controls;
  }

  ngOnInit(): void {}

  onCanceled() {
    this.canceled.emit(true);
  }

  ngOnSubmit() {
    this.loading = true;
    this.authService
      .checkUuid(this.uuidActivation.controls.uuid.value)
      .then((response: User) => {
        this.loading = false;
        const user: User = {
          ...response,
          uuid: this.uuidActivation.controls.uuid.value
        };
        this.validated.emit(user);
      })
      .catch(err => {
        this.loading = false;
        this.msgFromBack = err.status;
      });
  }
}
