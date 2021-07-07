import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveCardComponent } from './archive-card.component';

describe('ArchiveCardComponent', () => {
  let component: ArchiveCardComponent;
  let fixture: ComponentFixture<ArchiveCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
