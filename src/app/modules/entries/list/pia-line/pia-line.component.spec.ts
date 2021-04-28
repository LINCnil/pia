import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiaLineComponent } from './pia-line.component';

describe('PiaLineComponent', () => {
  let component: PiaLineComponent;
  let fixture: ComponentFixture<PiaLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PiaLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PiaLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
