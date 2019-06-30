import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberMessagesComponent } from './member-messages.component';

describe('MemberMessagesComponent', () => {
  let component: MemberMessagesComponent;
  let fixture: ComponentFixture<MemberMessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
