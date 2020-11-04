import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PiaValidateHistoryComponent } from './pia-validate-history.component';

describe('PiaValidateHistoryComponent', () => {
  let component: PiaValidateHistoryComponent;
  let fixture: ComponentFixture<PiaValidateHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PiaValidateHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PiaValidateHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
