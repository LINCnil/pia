import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiaCardComponent } from './pia-card.component';

describe('PiaCardComponent', () => {
  let component: PiaCardComponent;
  let fixture: ComponentFixture<PiaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PiaCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PiaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
