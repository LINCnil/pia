import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBaseFiltersComponent } from './knowledge-base-filters.component';

describe('KnowledgeBaseFiltersComponent', () => {
  let component: KnowledgeBaseFiltersComponent;
  let fixture: ComponentFixture<KnowledgeBaseFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeBaseFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeBaseFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
