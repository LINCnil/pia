import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiaComponent } from './pia.component';

describe('PiaComponent', () => {
  let component: PiaComponent;
  let fixture: ComponentFixture<PiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PiaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
