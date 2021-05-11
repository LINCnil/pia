import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['../form.scss', './sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  @Output() canceled = new EventEmitter<boolean>();
  @Output() validated = new EventEmitter<boolean>();
  @Output() forget = new EventEmitter<boolean>();
  loading: boolean = false;
  logIn: FormGroup;
  @Input() fromSignUp: boolean;
  msgFromBack: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    // Prepare login form
    this.logIn = this.formBuilder.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.logIn.controls;
  }

  ngOnInit(): void {}

  onCanceled() {
    this.canceled.emit(true);
  }

  onForget() {
    this.forget.emit(true);
  }

  ngOnSubmit() {
    this.loading = true;
    this.authService
      .login(
        this.logIn.controls.login.value,
        this.logIn.controls.password.value
      )
      .then(() => {
        this.loading = false;
        this.validated.emit(true);
      })
      .catch(err => {
        this.loading = false;
        this.msgFromBack = err.message;
      });
  }
}
