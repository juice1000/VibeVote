import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
// import { TestComponent } from '../test/test.component';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [Router, AuthService],
      providers: [Router, AuthService],
      // providers: [AuthService]
      // providers: [Router]
      // providers: [TestComponent]
      // providers: [TestBed]

      // providers: [TestBed]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    await component.joinSession();
    await component.loginWithSpotify();

    console.log(component.sessionId);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
