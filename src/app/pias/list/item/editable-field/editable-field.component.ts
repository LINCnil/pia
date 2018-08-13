import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-editable-field',
  templateUrl: './editable-field.component.html',
  styleUrls: ['./editable-field.component.scss']
})
export class EditableFieldComponent implements OnInit {
  @Input() formControlObject: FormControl;
  @Input() model: any  = null;
  @Input() label: string  = null;
  @Input() modelAttribute: string  = null;
  @Output() updated = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {}

  onFocusOut() {
    if (this.formControlObject.value !== this.model[this.modelAttribute]) {
      this.model[this.modelAttribute] = this.formControlObject.value;
      this.updated.emit(this.model);
    }
  }
}
