import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

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
  logIn: UntypedFormGroup;
  @Input() fromSignUp: boolean;
  msgFromBack: string;
  ssoEnabled: boolean;

  constructor(
    private formBuilder: UntypedFormBuilder,
    public authService: AuthService
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
        this.msgFromBack = err.status;
      });
  }

  loginSSO() {
    this.authService.loginSSO();
  }
}
