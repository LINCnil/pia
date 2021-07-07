import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgebaseCardComponent } from './knowledgebase-card.component';

describe('KnowledgebaseCardComponent', () => {
  let component: KnowledgebaseCardComponent;
  let fixture: ComponentFixture<KnowledgebaseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgebaseCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgebaseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
