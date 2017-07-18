import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasuresComponent } from './measures.component';

describe('MeasuresComponent', () => {
  let component: MeasuresComponent;
  let fixture: ComponentFixture<MeasuresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeasuresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
