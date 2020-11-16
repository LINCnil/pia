import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Dialog } from '../models/dialog.model';


@Injectable()
export class DialogService {
  private subject = new Subject<any>();

  confirmThis(message: Dialog, yesFn: () => void, noFn: () => void): any {
    this.setConfirmation(message, yesFn, noFn);
  }

  setConfirmation(message: Dialog, yesFn: () => void, noFn: () => void): any {
    const that = this;
    this.subject.next({
        type: 'confirm',
        ...message,
        yesFn(): any {
                that.subject.next(); // This will close the modal
                yesFn();
            },
        noFn(): any {
            that.subject.next();
            noFn();
        }
    });
  }

  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }

}
