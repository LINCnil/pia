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
    const HttpClient = function() {
    this.get = function(aUrl, aCallback) {
      const anHttpRequest = new XMLHttpRequest();
      anHttpRequest.onreadystatechange = function() {
        if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200) {
          aCallback(anHttpRequest.responseText);
        }
      }
      anHttpRequest.open( 'GET', aUrl, true );
      anHttpRequest.send( null );
    }
  }

  const client = new HttpClient();
  client.get('https://www.google.fr/', function(response) {
      console.log(response);
  });

    // if ok
      /*localStorage.setItem('server_url', this.settingsForm.value.server_url);
      this._modalsService.openModal('modal-update-server-url-ok');*/
    // else
      // this._modalsService.openModal('modal-update-server-url-nok');
  }
}
