import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionTextItemComponent } from './question-text-item.component';

describe('QuestionTextItemComponent', () => {
  let component: QuestionTextItemComponent;
  let fixture: ComponentFixture<QuestionTextItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionTextItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionTextItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
