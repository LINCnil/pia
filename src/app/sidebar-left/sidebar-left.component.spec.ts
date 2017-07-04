import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarLeftComponent } from './sidebar-left.component';

describe('SidebarLeftComponent', () => {
  let component: SidebarLeftComponent;
  let fixture: ComponentFixture<SidebarLeftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarLeftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
