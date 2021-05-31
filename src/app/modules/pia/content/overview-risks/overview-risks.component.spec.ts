import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OverviewRisksComponent } from './overview-risks.component';

describe('OverviewRisksComponent', () => {
  let component: OverviewRisksComponent;
  let fixture: ComponentFixture<OverviewRisksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewRisksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewRisksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
