import { Component, OnInit, Input, Output } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { PiaService } from 'app/entry/pia.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
  providers: [PiaService]
})
export class SectionsComponent implements OnInit {

  @Input() section: { id: number, title: string, display_mode: string, short_help: string, items: any };
  @Input() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Input() data: any;

  constructor(private _piaService: PiaService) {
  }

  ngOnInit() {
    this._piaService.getPIA();
  }

  /**
   * Shows the validation button with a disabled state.
   * @return true if the PIA is ongoing, false otherwise.
   */
  lockedValidationButton() {
    return this._piaService.pia.status === 0;
  }

  /**
   * Shows the validation button in the navigation.
   * @return true if the PIA is validated, false otherwise.
   */
  showValidationButton() {
    return (this._piaService.pia.status === 2 || this._piaService.pia.status === 3);
  }

  /**
   * Shows the refuse button in the navigation.
   * @return true if the PIA is refused, false otherwise.
   */
  showRefuseButton() {
    if (((this._piaService.pia.status === 2 || this._piaService.pia.status === 3) &&
            this._piaService.pia.rejected_reason) || this._piaService.pia.status === 1 ) {
      return true;
    } else {
      return false;
    }
  }
}
