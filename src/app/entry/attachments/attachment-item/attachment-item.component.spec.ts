import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentItemComponent } from './attachment-item.component';

describe('AttachmentItemComponent', () => {
  let component: AttachmentItemComponent;
  let fixture: ComponentFixture<AttachmentItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

