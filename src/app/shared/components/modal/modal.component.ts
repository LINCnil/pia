import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ModalComponent implements OnInit {
  @Input() specialClass: string;
  @Output() clickOnClose = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
