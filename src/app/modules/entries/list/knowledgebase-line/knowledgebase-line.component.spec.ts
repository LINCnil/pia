import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgebaseLineComponent } from './knowledgebase-line.component';

describe('KnowledgebaseLineComponent', () => {
  let component: KnowledgebaseLineComponent;
  let fixture: ComponentFixture<KnowledgebaseLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgebaseLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgebaseLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
