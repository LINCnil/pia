import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureLineComponent } from './structure-line.component';

describe('StructureLineComponent', () => {
  let component: StructureLineComponent;
  let fixture: ComponentFixture<StructureLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructureLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
