import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBaseComponent } from './knowledge-base.component';

describe('KnowledgeBaseComponent', () => {
  let component: KnowledgeBaseComponent;
  let fixture: ComponentFixture<KnowledgeBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
