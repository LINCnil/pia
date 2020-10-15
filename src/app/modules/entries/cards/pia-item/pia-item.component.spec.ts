import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiaItemComponent } from './pia-item.component';

describe('PiaItemComponent', () => {
  let component: PiaItemComponent;
  let fixture: ComponentFixture<PiaItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PiaItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PiaItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
