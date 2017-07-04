import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBaseSearchComponent } from './knowledge-base-search.component';

describe('KnowledgeBaseSearchComponent', () => {
  let component: KnowledgeBaseSearchComponent;
  let fixture: ComponentFixture<KnowledgeBaseSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeBaseSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeBaseSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
