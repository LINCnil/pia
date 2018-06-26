import { Component } from '@angular/core';
import { BaseModalComponent } from 'app/modals/base-modal.component';
import { Router } from '@angular/router';
import { ModalService } from 'app/modals/modal.service';


@Component({
    selector: 'simple-pia-validation-modal',
    template: `
  <div class="pia-modalBlock" id="modal-simple-pia-validation">
    <div class="pia-modalBlock-content bounceIn">
        <button tabindex="2" type="button" class="pia-modalBlock-close btn" title="{{ 'modals.close' | translate }}" (click)="closeModal()">
            <span class="pia-icons pia-icon-close-big"></span>
        </button>
        <p>{{ 'modals.simple_pia_validation.content' | translate }}</p>
        <i class="fa fa-check icon-green" aria-hidden="true"></i>
        <div class="pia-modalBlock-validate">
            <button tabindex="1" class="btn btn-green get-focus" type="button" (click)="returnToHomepage()">{{ 'modals.back_to_home' | translate }}</button>
        </div>
    </div>
</div>
`,
    styleUrls: [],
    providers: []
})


export class SimplePiaValidationModal extends BaseModalComponent {

    constructor(router: Router, modalService: ModalService) {
        super(router, modalService);
    }
}
