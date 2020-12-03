import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-url',
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.scss']
})
export class UrlComponent implements OnInit {
  settingsForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.settingsForm = this.fb.group({
      id: 1,
      server_url: ['', Validators.required]
    });
    this.settingsForm.patchValue({
      server_url: localStorage.getItem('server_url')
    });
  }

  /**
   * Record the URL of the server.
   */
  onSubmit() {
    /* Set it back to empty if server mode is disabled */
    if (
      this.settingsForm.controls['server_url'].value === null ||
      this.settingsForm.controls['server_url'].value.length <= 0
    ) {
      localStorage.removeItem('server_url');
      this.dialogService.confirmThis(
        {
          text: 'modals.update_server_url_ok.content',
          type: 'yes',
          yes: 'modals.back_to_home',
          no: '',
          icon: 'pia-icons pia-icon-happy'
        },
        () => {
          window.location.href = './';
        },
        () => {
          return;
        }
      );
    } else {
      const serverUrl = this.settingsForm.value.server_url.trim();
      fetch(serverUrl + '/pias', {
        mode: 'cors'
      })
        .then(response => {
          return response.ok;
        })
        .then((ok: boolean) => {
          if (ok) {
            localStorage.setItem('server_url', serverUrl);
            this.dialogService.confirmThis(
              {
                text: 'modals.update_server_url_ok.content',
                type: 'yes',
                yes: 'modals.back_to_home',
                no: '',
                icon: 'pia-icons pia-icon-happy'
              },
              () => {
                window.location.href = './';
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
    }
  }
}
