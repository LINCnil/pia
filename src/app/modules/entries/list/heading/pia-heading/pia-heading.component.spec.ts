import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiaHeadingComponent } from './pia-heading.component';

describe('PiaHeadingComponent', () => {
  let component: PiaHeadingComponent;
  let fixture: ComponentFixture<PiaHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PiaHeadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PiaHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
