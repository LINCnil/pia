import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UuidComponent } from './uuid.component';

describe('UuidComponent', () => {
  let component: UuidComponent;
  let fixture: ComponentFixture<UuidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UuidComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UuidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
