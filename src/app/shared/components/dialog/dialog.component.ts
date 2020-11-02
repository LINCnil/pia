import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/services/dialog.service';
import { LanguagesService } from 'src/app/services/languages.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['../modal/modal.component.scss']
})
export class DialogComponent implements OnInit {
  message: any;
  constructor(
    private dialogService: DialogService,
    public languagesService: LanguagesService
  ) { }

  ngOnInit(): void {
    this.dialogService.getMessage().subscribe(message => {
        this.message = message;
    });
  }

}
