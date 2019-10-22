import { Component, Input, OnInit } from '@angular/core';

import { ModalsService } from 'src/app/modals/modals.service';

@Component({
  selector: `.app-list-item`,
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  providers: []
})
export class ListItemComponent implements OnInit {
  @Input() archivedPia: any;

  constructor(private _modalsService: ModalsService) { }

  ngOnInit() { }

  /**
   * Opens the modal to confirm deletion of an archived PIA
   * @param {string} id - The archived PIA id.
   */
  remove(id: string) {
    localStorage.setItem('archive-id', id);
    this._modalsService.openModal('modal-remove-archived-pia');
  }

}
