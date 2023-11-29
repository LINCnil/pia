import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['../form.scss', './forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  @Output() canceled = new EventEmitter<boolean>();
  @Output() validated = new EventEmitter<boolean>();
  forgetPassword: UntypedFormGroup;
  loading: boolean = false;
  msgFromBack: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    // Prepare forgetPassword form
    this.forgetPassword = this.formBuilder.group({
      email: ['', Validators.required]
    });
  }

  get f() {
    return this.forgetPassword.controls;
  }

  ngOnInit(): void {}

  onCanceled() {
    this.canceled.emit(true);
  }

  ngOnSubmit() {
    this.loading = true;
    this.authService
      .reset(this.forgetPassword.controls.email.value)
      .then(() => {
        this.loading = false;
        this.validated.emit(true);
      })
      .catch(err => {
        this.loading = false;
        console.log(err.status);
        this.msgFromBack = err.status;
      });
  }
}
