import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableFieldComponent } from './editable-field.component';

describe('EditableFieldComponent', () => {
  let component: EditableFieldComponent;
  let fixture: ComponentFixture<EditableFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditableFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditableFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
