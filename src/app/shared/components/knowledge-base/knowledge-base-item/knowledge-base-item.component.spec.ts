import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KnowledgeBaseItemComponent } from './knowledge-base-item.component';

describe('KnowledgeBaseItemComponent', () => {
  let component: KnowledgeBaseItemComponent;
  let fixture: ComponentFixture<KnowledgeBaseItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeBaseItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeBaseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
