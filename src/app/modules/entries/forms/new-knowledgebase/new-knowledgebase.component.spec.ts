import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewKnowledgebaseComponent } from './new-knowledgebase.component';

describe('NewKnowledgebaseComponent', () => {
  let component: NewKnowledgebaseComponent;
  let fixture: ComponentFixture<NewKnowledgebaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewKnowledgebaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewKnowledgebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
