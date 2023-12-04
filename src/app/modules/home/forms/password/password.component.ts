import { Input } from '@angular/core';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators
} from '@angular/forms';
import { CustomValidators } from 'src/app/shared/validators/custom-validators';

import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['../form.scss', './password.component.scss']
})
export class PasswordComponent implements OnInit {
  @Input() reset = false;
  @Input() accountData = null;
  @Output() canceled = new EventEmitter<boolean>();
  @Output() validated = new EventEmitter<boolean>();
  loading: boolean = false;
  signUp: UntypedFormGroup;
  msgFromBack: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    // Prepare signUp form
    this.signUp = this.formBuilder.group(
      {
        password: [
          '',
          [
            Validators.compose([
              // 1. Password Field is Required
              Validators.required,
              // 2. check whether the entered password has a number
              CustomValidators.patternValidator(/\d/, { hasNumber: true }),
              // 3. check whether the entered password has upper case letter
              CustomValidators.patternValidator(/[A-Z]/, {
                hasCapitalCase: true
              }),
              // 4. check whether the entered password has a lower-case letter
              CustomValidators.patternValidator(/[a-z]/, {
                hasSmallCase: true
              }),
              // 5. check whether the entered password has a special char
              CustomValidators.patternValidator(/[!@#$%^&*(),.?":{}|<>_' -]/, {
                hashSpecialChar: true
              }),
              // 6. Has a minimum length of 8 characters
              Validators.minLength(12)
            ])
          ]
        ],
        confirmPassword: new UntypedFormControl('', [Validators.required])
      },
      {
        // check whether our password and confirm password match
        validator: CustomValidators.passwordMatchValidator
      }
    );

    this.signUp.get('password').valueChanges.subscribe(x => {
      if (x.length <= 0 || this.f.password.errors) {
        this.signUp.controls['confirmPassword'].disable();
        this.signUp.patchValue({ confirmPassword: '' });
      } else {
        this.signUp.controls['confirmPassword'].enable();
      }
    });
  }

  get f() {
    return this.signUp.controls;
  }

  ngOnInit(): void {}

  onCanceled() {
    this.canceled.emit(true);
  }

  ngOnSubmit() {
    this.loading = true;
    this.authService
      .sendPassword(
        this.accountData.id,
        this.signUp.controls.password.value,
        this.signUp.controls.confirmPassword.value,
        this.accountData.uuid
      )
      .then(() => {
        this.loading = false;
        this.validated.emit(true);
      })
      .catch(err => {
        this.loading = false;
        this.msgFromBack = err.status;
      });
  }
}
