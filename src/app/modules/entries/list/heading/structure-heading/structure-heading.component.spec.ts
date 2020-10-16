import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureHeadingComponent } from './structure-heading.component';

describe('StructureHeadingComponent', () => {
  let component: StructureHeadingComponent;
  let fixture: ComponentFixture<StructureHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructureHeadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
