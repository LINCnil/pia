import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListItemFolderComponent } from './list-item-folder.component';

describe('ListItemFolderComponent', () => {
  let component: ListItemFolderComponent;
  let fixture: ComponentFixture<ListItemFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListItemFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListItemFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
