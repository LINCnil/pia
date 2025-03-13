import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';
import {
  faPenToSquare,
  faGear,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['../modal/modal.component.scss'],
  standalone: false
})
export class DialogComponent implements OnInit {
  message: any;
  protected readonly faPenToSquare = faPenToSquare;
  protected readonly faGear = faGear;
  protected readonly faXmark = faXmark;
  constructor(
    private dialogService: DialogService,
    public languagesService: LanguagesService
  ) {}

  ngOnInit(): void {
    this.dialogService.getMessage().subscribe(message => {
      this.message = message;
    });
  }
}
