import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RevisionsComponent } from './revisions.component';

describe('RevisionsComponent', () => {
  let component: RevisionsComponent;
  let fixture: ComponentFixture<RevisionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RevisionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
