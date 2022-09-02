import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'src/app/services/dialog.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  public base: string;
  public defaultConfig: any = {
    headers: new Headers(),
    mode: 'cors'
  };

  constructor(
    private dialogService: DialogService,
    private translateService: TranslateService
  ) {
    this.base = localStorage.getItem('server_url')
      ? localStorage.getItem('server_url')
      : '';
  }

  public get(path) {
    return new Promise((resolve, reject) => {
      fetch(this.base + path, {
        ...this.defaultConfig,
        method: 'GET'
      })
        .then(async (response: Response) => {
          let result = null;
          if (!response.ok) {
            let message = this.translateService.instant(
              'authentication.transaction_error'
            );
            if (result && result.message && result.message.length > 0) {
              message = result.message;
            }
            throw response;
          } else {
            result = await response.json();
            return result;
          }
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
          if (
            (err.status === 401 || err.status === 500) &&
            !err.url.includes('oauth/token/info')
          ) {
            this.dialogService.confirmThis(
              {
                text: 'authentification.errors.unauthorized',
                type: 'yes',
                yes: 'modals.back_to_home',
                no: '',
                icon: 'pia-icons pia-icon-sad',
                data: {
                  no_cross_button: true
                }
              },
              () => {
                window.location.href = './';
              },
              () => {
                return;
              }
            );
          }
        });
    });
  }

  public getBlob(path) {
    return new Promise((resolve, reject) => {
      fetch(this.base + path, {
        ...this.defaultConfig,
        method: 'GET'
      })
        .then((response: Response) => {
          if (!response.ok) {
            reject(
              new Error(
                this.translateService.instant(
                  'authentication.transaction_error'
                )
              )
            );
          }
          return response.blob();
        })
        .then(blob => {
          resolve(blob);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public post(path, params) {
    return new Promise((resolve, reject) => {
      fetch(this.base + path, {
        ...this.defaultConfig,
        method: 'POST',
        body: params
      })
        .then(async (response: any) => {
          let result = null;
          if (response.status != 204) {
            result = await response.json();
          }
          if (!response.ok) {
            let message = this.translateService.instant(
              'authentication.transaction_error'
            );
            if (result && result.message && result.message.length > 0) {
              message = result.message;
            }
            throw response;
          }
          return result;
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public put(path, params) {
    return new Promise((resolve, reject) => {
      this.update(path, 'PUT', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public patch(path, params) {
    return new Promise((resolve, reject) => {
      this.update(path, 'PATCH', params)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  private update(path, type, params) {
    return new Promise((resolve, reject) => {
      fetch(this.base + path, {
        ...this.defaultConfig,
        method: type,
        body: params
      })
        .then(async (response: any) => {
          let result = null;
          if (response.status != 204) {
            result = await response.json();
          }
          if (!response.ok) {
            let message = this.translateService.instant(
              'authentication.transaction_error'
            );

            if (result && result.message && result.message.length > 0) {
              message = result.message;
            }

            const responseError = {
              statusText: response.statusText || 'Error',
              message: message || 'Something went wrong'
            };

            let error = new Error();
            error = {
              ...error,
              ...result.errors,
              ...response,
              ...responseError
            };
            throw error;
          }
          return result;
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          // Conflict Modale
          if (err.statusText === 'Conflict') {
            this.conflictModal(err);
          }
          reject(err);
        });
    });
  }

  public delete(path) {
    return new Promise((resolve, reject) => {
      fetch(this.base + path, {
        ...this.defaultConfig,
        method: 'DELETE'
      })
        .then(async (response: Response) => {
          let result = null;
          if (response.status != 204) {
            result = await response.json();
          }
          if (!response.ok) {
            let message = this.translateService.instant(
              'authentication.transaction_error'
            );
            if (result && result.message && result.message.length > 0) {
              message = result.message;
            }
            reject(new Error(message));
          }
          return result;
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public conflictModal(err) {
    let additional_text = '';
    switch (err.model) {
      case 'answer':
        additional_text = `
          Contenu initial: ${err.record.data.text}
          <br>
          Nouveau contenu: ${err.params.data.text}
        `;
        break;
      case 'pia':
        additional_text = `

        `;
        break;
      default:
        break;
    }

    this.dialogService.confirmThis(
      {
        text: 'authentification.errors.conflict',
        type: 'yes',
        yes: 'modals.back_to_home',
        no: '',
        icon: 'pia-icons pia-icon-sad',
        data: {
          additional_text,
          no_cross_button: false
        }
      },
      () => {
        window.location.href = './';
      },
      () => {
        return;
      }
    );
  }
}
