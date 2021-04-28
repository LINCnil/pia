import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStructureComponent } from './new-structure.component';

describe('NewStructureComponent', () => {
  let component: NewStructureComponent;
  let fixture: ComponentFixture<NewStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewStructureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
