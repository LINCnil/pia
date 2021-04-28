import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPiaComponent } from './new-pia.component';

describe('NewPiaComponent', () => {
  let component: NewPiaComponent;
  let fixture: ComponentFixture<NewPiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPiaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
