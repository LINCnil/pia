import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewSectionsComponent } from './preview-sections.component';

describe('PreviewSectionsComponent', () => {
  let component: PreviewSectionsComponent;
  let fixture: ComponentFixture<PreviewSectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewSectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
