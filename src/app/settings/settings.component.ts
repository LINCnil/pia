import { Component, Input, OnInit } from '@angular/core';
import { Settings } from './settings.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  setting: Settings;
  settingsForm: FormGroup;
  constructor(private fb: FormBuilder,
              private _modalsService: ModalsService) {
  }

  ngOnInit() {
    this.settingsForm = this.fb.group({
      id: 1,
      server_url: ['', Validators.required ]
    });
    this.setting = new Settings();
    this.setting.existEntry(1).then((existEntry: boolean) => {
      if (existEntry) {
        this.setting.get(1).then(() => {
          this.settingsForm.patchValue({ server_url: this.setting.server_url });
        });
      } else {
        this.setting.id = 1;
        this.setting.server_url = '';
        this.setting.create();
      }
    });
  }

  onSubmit() {
    this.setting.server_url = this.settingsForm.value.server_url;
    this.setting.update();
    this._modalsService.openModal('modal-update-server-url');
  }
}
