import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationCallbackComponent } from './authentication-callback.component';

describe('AuthenticationCallbackComponent', () => {
  let component: AuthenticationCallbackComponent;
  let fixture: ComponentFixture<AuthenticationCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthenticationCallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthenticationCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
