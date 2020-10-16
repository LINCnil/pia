import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgebaseHeadingComponent } from './knowledgebase-heading.component';

describe('KnowledgebaseHeadingComponent', () => {
  let component: KnowledgebaseHeadingComponent;
  let fixture: ComponentFixture<KnowledgebaseHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgebaseHeadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgebaseHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
