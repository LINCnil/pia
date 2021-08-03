import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionPreviewComponent } from './revision-preview.component';

describe('RevisionPreviewComponent', () => {
  let component: RevisionPreviewComponent;
  let fixture: ComponentFixture<RevisionPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RevisionPreviewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
