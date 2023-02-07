import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-url',
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.scss']
})
export class UrlComponent implements OnInit {
  settingsForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    public authService: AuthService,
    public apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      id: 1,
      server_url: ['', Validators.required],
      client_id: ['', Validators.required],
      client_secret: ['', Validators.required]
    });

    this.settingsForm.patchValue({
      server_url: localStorage.getItem('server_url'),
      client_id: localStorage.getItem('client_id')
        ? localStorage.getItem('client_id')
        : '',
      client_secret: localStorage.getItem('client_secret')
        ? localStorage.getItem('client_secret')
        : ''
    });

    this.settingsForm.valueChanges.subscribe(val => {
      if (val.client_id.includes(' ') || val.client_secret.includes(' ')) {
        this.settingsForm.controls.client_id.patchValue(
          val.client_id.replace(' ', ''),
          { emitEvent: false }
        );
        this.settingsForm.controls.client_secret.patchValue(
          val.client_secret.replace(' ', ''),
          { emitEvent: false }
        );
      }
    });
  }

  /**
   * Record the URL of the server.
   */
  onSubmit(): void {
    if (
      this.settingsForm.controls.server_url.value &&
      this.settingsForm.controls.server_url.value != ''
    ) {
      const serverUrl = this.settingsForm.value.server_url.trim();
      fetch(serverUrl + '/info', {
        mode: 'cors'
      })
        .then(response => {
          return response.ok;
        })
        .then((ok: boolean) => {
          if (ok) {
            localStorage.setItem('server_url', serverUrl);
            // TODO: Find another securely way
            localStorage.setItem(
              'client_id',
              this.settingsForm.value.client_id
            );
            localStorage.setItem(
              'client_secret',
              this.settingsForm.value.client_secret
            );
            this.apiService.base = serverUrl;
            this.authService.state = true;
            this.dialogService.confirmThis(
              {
                text: 'modals.update_server_url_ok.content',
                type: 'yes',
                yes: 'modals.back_to_home',
                no: '',
                icon: 'pia-icons pia-icon-happy',
                data: {
                  no_cross_button: true
                }
              },
              () => {
                if (this.authService.currentUserValue == null) {
                  window.location.href = './#/';
                } else {
                  window.location.href = './#/entries';
                }
              },
              () => {
                return;
              }
            );
          } else {
            this.dialogService.confirmThis(
              {
                text: 'modals.update_server_url_nok.content',
                type: 'yes',
                yes: 'modals.close',
                no: '',
                icon: 'pia-icons pia-icon-sad'
              },
              () => {
                return;
              },
              () => {
                return;
              }
            );
          }
        })
        .catch(error => {
          console.error('Request failed', error);
          this.dialogService.confirmThis(
            {
              text: 'modals.update_server_url_nok.content',
              type: 'yes',
              yes: 'modals.close',
              no: '',
              icon: 'pia-icons pia-icon-sad'
            },
            () => {
              return;
            },
            () => {
              return;
            }
          );
        });
    } else {
      /* Logout and reset authService */
      this.apiService.base = null;
      this.authService.logout();
      this.authService.state = false;
      localStorage.removeItem('server_url');
      this.dialogService.confirmThis(
        {
          text: 'modals.update_server_url_ok.content',
          type: 'yes',
          yes: 'modals.back_to_home',
          no: '',
          icon: 'pia-icons pia-icon-happy',
          data: {
            no_cross_button: true
          }
        },
        () => {
          window.location.href = './#/';
        },
        () => {
          return;
        }
      );
    }
  }
}
