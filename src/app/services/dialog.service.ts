import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Dialog } from '../models/dialog.model';

@Injectable()
export class DialogService {
  private subject = new Subject<any>();

  confirmThis(message: Dialog, yesFn: () => void, noFn: () => void): any {
    const header = document.querySelector('.pia-headerBlock');
    const container = document.querySelector('.pia-mainContainerBlock');
    const specialRevisionModal = document.querySelector(
      '.revision-preview-modal'
    );
    if (header) {
      header.classList.add('blur');
    }
    if (container) {
      container.classList.add('blur');
    }
    if (specialRevisionModal) {
      specialRevisionModal.classList.toggle('noBackground');
    }
    this.setConfirmation(message, yesFn, noFn);
  }

  setConfirmation(message: Dialog, yesFn: () => void, noFn: () => void): any {
    const that = this;
    const header = document.querySelector('.pia-headerBlock');
    const container = document.querySelector('.pia-mainContainerBlock');
    const specialRevisionModal = document.querySelector(
      '.revision-preview-modal'
    );
    this.subject.next({
      type: 'confirm',
      ...message,
      yesFn(): any {
        that.subject.next(); // This will close the modal
        yesFn();
        header.classList.remove('blur');
        container.classList.remove('blur');
        if (specialRevisionModal) {
          specialRevisionModal.classList.toggle('noBackground');
        }
      },
      noFn(): any {
        that.subject.next();
        noFn();
        header.classList.remove('blur');
        container.classList.remove('blur');
        if (specialRevisionModal) {
          specialRevisionModal.classList.toggle('noBackground');
        }
      }
    });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
