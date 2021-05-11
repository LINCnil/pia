import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-uuid',
  templateUrl: './uuid.component.html',
  styleUrls: ['../form.scss', './uuid.component.scss']
})
export class UuidComponent implements OnInit {
  @Output() canceled = new EventEmitter<boolean>();
  @Output() validated = new EventEmitter<boolean>();

  loading: boolean = false;
  uuidActivation: FormGroup;
  uuidRegex = new RegExp(
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  );

  msgFromBack: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    // Prepare uuid form
    this.uuidActivation = this.formBuilder.group({
      uuid: new FormControl('', [
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
      .then(() => {
        this.loading = false;
        this.validated.emit(true);
      })
      .catch(err => {
        this.loading = false;
        this.msgFromBack = err;
      });
  }
}
