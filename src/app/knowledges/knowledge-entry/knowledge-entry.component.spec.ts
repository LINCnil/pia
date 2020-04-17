import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeEntryComponent } from './knowledge-entry.component';

describe('KnowledgeEntryComponent', () => {
  let component: KnowledgeEntryComponent;
  let fixture: ComponentFixture<KnowledgeEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KnowledgeEntryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
