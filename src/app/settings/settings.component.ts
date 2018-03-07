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
    localStorage.setItem('server_url', this.settingsForm.value.server_url);
    this._modalsService.openModal('modal-update-server-url');
  }
}
