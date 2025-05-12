import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
  standalone: false
})
export class LoadingOverlayComponent implements OnInit {
  @Input() visibility: boolean;
  @Input() childMode = false;
  constructor() {}

  ngOnInit() {}
}
