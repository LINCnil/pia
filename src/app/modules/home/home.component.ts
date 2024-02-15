import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';
import { CustomValidators } from 'src/app/shared/validators/custom-validators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  signUp: UntypedFormGroup;
  logIn: UntypedFormGroup;
  fromValidation: boolean = false;
  stepForm = 'logIn';
  public accountData = null;

  constructor(
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private renderer: Renderer2,
    public translateService: TranslateService,
    public languagesService: LanguagesService,
    public authService: AuthService
  ) {
    this.authService.currentUser.subscribe({
      complete: () => {
        if (this.authService.state) {
          if (this.authService.currentUserValue) {
            this.router.navigate(['entries']);
          }
        }
      }
    });

    this.renderer.addClass(document.body, 'pia-authentication');

    // Prepare login form
    this.logIn = this.formBuilder.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Prepare sign up form
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
              CustomValidators.patternValidator(/[!@#$%^&*(),.?":{}|<>]/, {
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
  }

  ngOnInit(): void {
    const displayMessage = document.querySelector(
      '.pia-closeFullScreenModeAlertBlock'
    );
    window.screenTop === 0 && window.screenY === 0
      ? displayMessage.classList.remove('hide')
      : displayMessage.classList.add('hide');
    window.onresize = event => {
      window.screenTop === 0 && window.screenY === 0
        ? displayMessage.classList.remove('hide')
        : displayMessage.classList.add('hide');
    };
  }

  get signUpForm() {
    return this.signUp.controls;
  }

  onSubmited() {
    this.router.navigate(['entries']);
  }

  changeDisplay(step) {
    switch (step) {
      case 'checkUuid':
        this.stepForm = 'checkUuid';
        break;
      case 'signUp':
        this.stepForm = 'signUp';
        break;
      case 'logIn':
        this.stepForm = 'logIn';
        break;
      case 'forgetPassword':
        this.stepForm = 'forgetPassword';
        break;
      case 'resetPassword':
        this.stepForm = 'resetPassword';
        break;
      case 'newPassword':
        this.stepForm = 'newPassword';
        break;
      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'pia-authentication');
  }
}
