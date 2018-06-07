import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderItemComponent } from './folder-item.component';

describe('FolderItemComponent', () => {
  let component: FolderItemComponent;
  let fixture: ComponentFixture<FolderItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
