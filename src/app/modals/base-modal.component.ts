import {ModalService} from './modal.service';
import { Router } from '@angular/router';


export class BaseModalComponent {
 
    
    constructor(protected router: Router, protected modalService: ModalService){}


    close(){
        this.modalService.destroy();
    }

    returnToHomepage() {
        this.close();
        this.router.navigate(['/home']);
      }
}
