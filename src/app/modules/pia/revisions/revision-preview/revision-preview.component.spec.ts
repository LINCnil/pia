import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RevisionPreviewComponent } from './revision-preview.component';

describe('RevisionPreviewComponent', () => {
  let component: RevisionPreviewComponent;
  let fixture: ComponentFixture<RevisionPreviewComponent>;

  beforeEach(waitForAsync(() => {
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
