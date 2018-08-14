import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  constructor(private fb: FormBuilder,
              private _modalsService: ModalsService) {
  }

  ngOnInit() {
    this.settingsForm = this.fb.group({
      id: 1,
      server_url: ['', Validators.required ]
    });
    this.settingsForm.patchValue({ server_url: localStorage.getItem('server_url') });
  }

  /**
   * Record the URL of the server.
   * @memberof SettingsComponent
   */
  onSubmit() {
      /* Set it back to empty if server mode is disabled */
      if (this.settingsForm.controls['server_url'].value === null || this.settingsForm.controls['server_url'].value.length <= 0) {
        localStorage.removeItem('server_url');
        this._modalsService.openModal('modal-update-server-url-ok');
      } else {
        fetch(this.settingsForm.value.server_url).then((response) => {
          return response.status;
        }).then((httpCode: number) => {
          if (httpCode === 200) {
            localStorage.setItem('server_url', this.settingsForm.value.server_url);
            this._modalsService.openModal('modal-update-server-url-ok');
          } else {
            this._modalsService.openModal('modal-update-server-url-nok');
          }
        }).catch((error) => {
          console.error('Request failed', error);
          this._modalsService.openModal('modal-update-server-url-nok');
        });
      }
  }
}
