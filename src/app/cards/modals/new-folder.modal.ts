import { Component } from '@angular/core';
import { BaseModalComponent } from 'app/modals/base-modal.component';
import { Router } from '@angular/router';
import { ModalService } from 'app/modals/modal.service';
import { FolderModel } from '@api/models';
import { FormGroup, FormControl } from '@angular/forms';
import { FolderApi } from '@api/services';
import { PiaService } from 'app/entry/pia.service';


@Component({
    selector: 'new-folder-modal',
    template: `
<div class="pia-modalBlock" id="modal-list-new-folder">
    <div class="pia-modalBlock-content bounceIn">
        <button tabindex="1" type="button" class="close-modal-btn pia-modalBlock-close btn" title="{{ 'homepage.cards.title_close_creation' | translate }}"
            (click)="close()">
            <span class="pia-icons pia-icon-close"></span>
        </button>
        <form class="pia-cardsBlock-item-form" (ngSubmit)="onSubmit()" [formGroup]="folderForm">
            <div></div>
            <div>
                <label for="name">{{ 'homepage.cards.folder_name' | translate }}</label>
                <input formControlName="name" type="text" placeholder="{{ 'homepage.cards.folder_name' | translate }}" id="name" required />
            </div>
            <div style="height: 50px;"></div>
            <div class="pia-cardsBlock-item-btn">
                <button type="submit" [disabled]="folderForm.invalid" class="btn btn-green get-focus" id="pia-save-card-btn">{{ 'homepage.cards.create_folder' | translate }}</button>
            </div>
        </form>
    </div>
</div>

`,
    styleUrls: [],
    providers: []
})


export class NewFolderModal extends BaseModalComponent {

    newFolder: FolderModel;
    folderForm: FormGroup;


    constructor(router: Router, modalService: ModalService, private folderApi:FolderApi, public _piaService: PiaService) {
        super(router, modalService);

        this.folderForm = new FormGroup({
            name: new FormControl(),
        });
        this.newFolder = new FolderModel();
    }


    onSubmit() {
        const folder = new FolderModel();
        folder.name = this.folderForm.value.name;
        folder.parent = this._piaService.currentFolder;

        this.folderApi.create(folder).subscribe((newFolder: FolderModel) => {
            this.close();
            this.folderForm.reset();
            this._piaService.currentFolder.children.push(newFolder);
        });
    }

}
