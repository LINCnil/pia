import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective implements OnChanges {
  constructor(private el: ElementRef) {}

  @Input() defaultColor: [];

  @Input('appHighlight') highlightColor: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (changes.highlightColor || changes.defaultColor) {
        this.el.nativeElement.checked = this.everythingChecked(changes.highlightColor.currentValue);
      }
    }
  }

  everythingChecked(dataSection) {
    let bool = true;
    dataSection.items.forEach(dataItem => {
      let temp = this.defaultColor.findIndex(e => e === dataSection.id.toString() + dataItem.id.toString());
      if (temp == -1) {
        bool = false;
      }
    });
    return bool;
  }
}
