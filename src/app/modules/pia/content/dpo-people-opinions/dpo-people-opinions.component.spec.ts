import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DPOPeopleOpinionsComponent } from './dpo-people-opinions.component';

describe('DPOPeopleOpinionsComponent', () => {
  let component: DPOPeopleOpinionsComponent;
  let fixture: ComponentFixture<DPOPeopleOpinionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DPOPeopleOpinionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DPOPeopleOpinionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
