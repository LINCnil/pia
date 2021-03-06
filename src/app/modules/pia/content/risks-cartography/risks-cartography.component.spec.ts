import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RisksCartographyComponent } from './risks-cartography.component';

describe('RisksCartographyComponent', () => {
  let component: RisksCartographyComponent;
  let fixture: ComponentFixture<RisksCartographyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RisksCartographyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RisksCartographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
