import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../form.scss', './reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @Output() canceled = new EventEmitter<boolean>();
  @Output() validated = new EventEmitter<boolean>();
  resetPassword: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    // Prepare resetPassword form
    this.resetPassword = this.formBuilder.group({
      resetCode: ['', Validators.required]
    });
  }

  get f() {
    return this.resetPassword.controls;
  }

  ngOnInit(): void {}

  onCanceled() {
    this.canceled.emit(true);
  }

  ngOnSubmit() {
    return new Promise(resolve => {
      this.validated.emit(true);
      resolve(true);
    });
  }
}
