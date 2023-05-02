import { Location } from '@angular/common';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { HomeComponent } from './components/home/home.component';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';

import {
  // loginComponent,
  // playlistComponent,
  // homeComponent,
  routes,
} from './app-routing.module';
import { HttpClient } from '@angular/common/http';

describe('Router:App', () => {
  let location: Location;
  let router: Router;

  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let fixture: any;
  // let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
      ],
      declarations: [LoginComponent, PlaylistComponent, HomeComponent],
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router.initialNavigation();
  });

  let component: LoginComponent;

  it('navigate to login page', fakeAsync(() => {
    router.navigate(['/login']);
    tick();
    expect(location.path()).toBe('/login');
  }));

  it('navigate to home page', fakeAsync(() => {
    router.navigate(['/home']);
    tick();
    expect(location.path()).toBe('/home');
  }));
  it('navigate to Playlist  page', fakeAsync(() => {
    router.navigate(['/playlist/1']);

    tick();
    expect(location.path()).toBe('/playlist/1');
  }));
  it('redirects to the login page', fakeAsync(() => {
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/login');
  }));
  it('renders home component', fakeAsync(() => {
    router.navigate(['/home']);
    tick();
    fixture.detectChanges();
    expect(fixture.componentInstance.newPlaylistName).toBe('');
  }));
});
