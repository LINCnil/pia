import {Component, Input, OnInit} from '@angular/core';
import {PiaService} from 'app/entry/pia.service';
import {ModalsService} from 'app/modals/modals.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: `.app-list-item`,
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {
  @Input() pia: any;
  progress: number;
  constructor(private router: Router,
              private route: ActivatedRoute,
              private _modalsService: ModalsService,
              private _piaService: PiaService) { }

  ngOnInit() {
    this._piaService.getProgress(this.pia.id).then((nb: number) => {
      this.progress = nb;
    });
  }

  editPia() {
    this.router.navigate(['entry', this.pia.id, 'section', 1, 'item', 1]);
  }

  removePia(id: string) {
    localStorage.setItem('pia-id', id);
    this._modalsService.openModal('modal-remove-pia');
  }
}
