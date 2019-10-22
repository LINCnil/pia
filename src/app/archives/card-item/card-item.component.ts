import { Component, OnInit, Input } from '@angular/core';

import { ModalsService } from 'src/app/modals/modals.service';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss', './card-item_edit.component.scss', './card-item_doing.component.scss'],
  providers: []
})
export class CardItemComponent implements OnInit {
  @Input() archivedPia: any;
  @Input() previousArchivedPia: any;

  constructor(private _modalsService: ModalsService) { }

  ngOnInit() { }

  /**
   * Deletes an archived PIA with a given id.
   * @param {string} id - The archived PIA id.
   */
  remove(id: string) {
    localStorage.setItem('archive-id', id);
    this._modalsService.openModal('modal-remove-archived-pia');
  }

}
