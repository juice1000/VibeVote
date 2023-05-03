import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

class MockAuthService extends AuthService {
  joinSession() {
    return { spotifyPlayListId: '1234' };
  }
}

xdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let testBedService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [AuthService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    TestBed.overrideComponent(LoginComponent, {
      set: {
        providers: [{ provide: AuthService, useClass: MockAuthService }],
      },
    });
    testBedService = TestBed.get(AuthService);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Service injected via inject(...) and TestBed.get(...) should be the same instance', inject(
    [AuthService],
    (injectService: AuthService) => {
      expect(injectService).toBe(testBedService);
    }
  ));

  it('Component should be created', () => {
    expect(component.joinSession).toBeTruthy();
  });
  it('Component should have a sessionId', () => {
    expect(component.sessionId).toBeUndefined();
  });
  it('Component should have a loginWithSpotify', () => {
    expect(component.loginWithSpotify).toBeTruthy();
  });
  it('Component should have a joinSession', () => {
    expect(component.joinSession).toBeTruthy();
  });
});
