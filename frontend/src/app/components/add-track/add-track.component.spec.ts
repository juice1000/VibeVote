import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AuthService } from 'src/app/services/auth.service';
import {
  HttpHeaders,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';

import { AddTrackComponent } from './add-track.component';

import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AddTrackComponent', () => {
  let component: AddTrackComponent;
  let fixture: ComponentFixture<AddTrackComponent>;
  let authService: AuthService;
  let playlistService: PlaylistService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTrackComponent],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        PlaylistService,
        AuthService,
        {
          provide: HttpHeaders,
          useValue: { 'Content-Type': 'application/json' },
        },
        // { provide: HttpClient, useClass: MockHttpClient },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTrackComponent);
    component = fixture.componentInstance;
    playlistService = TestBed.get(PlaylistService);
    authService = TestBed.get(AuthService);
    await fixture.detectChanges();

    fixture.detectChanges();
  });

  // it('should have a trackName', () => {
  //   console.log('component trackname', component.trackName);
  //   expect(component.trackName).toBeDefined();
  //   expect(component.trackName).not.toBeNull();
  // });
  // it('should have a searchResults', () => {
  //   expect(component.searchResults).toBeDefined();
  // });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // it('should have a searchInput', () => {
  //   expect(component.searchInput).toBeTruthy();
  // });
  // it('should have a searchResults', () => {
  //   expect(component.searchResults).toBeDefined();
  // });
  it('should have a close button', () => {
    expect(component.close).toBeTruthy();
  });
});
