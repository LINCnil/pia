import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveLineComponent } from './archive-line.component';

describe('ArchiveLineComponent', () => {
  let component: ArchiveLineComponent;
  let fixture: ComponentFixture<ArchiveLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
