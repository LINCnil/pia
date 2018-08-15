import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuresComponent } from './structures.component';

describe('StructuresComponent', () => {
  let component: StructuresComponent;
  let fixture: ComponentFixture<StructuresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructuresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
