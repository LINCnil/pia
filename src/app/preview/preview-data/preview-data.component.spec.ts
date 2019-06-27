import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDataComponent } from './preview-data.component';

describe('PreviewDataComponent', () => {
  let component: PreviewDataComponent;
  let fixture: ComponentFixture<PreviewDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
