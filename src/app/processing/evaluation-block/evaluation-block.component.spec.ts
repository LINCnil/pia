import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationBlockComponent } from './evaluation-block.component';

describe('EvaluationBlockComponent', () => {
  let component: EvaluationBlockComponent;
  let fixture: ComponentFixture<EvaluationBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
