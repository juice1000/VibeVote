import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { AddTrackComponent } from './add-track.component';

describe('AddTrackComponent', () => {
  let component: AddTrackComponent;
  let fixture: ComponentFixture<AddTrackComponent>;
  let authService: AuthService;
  let playlistService: PlaylistService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTrackComponent],
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

  it('should have a trackName', () => {
    expect(component.trackName).toBeDefined();
    expect(component.trackName).not.toBeNull();
  });
  it('should have a searchResults', () => {
    expect(component.searchResults).toBeDefined();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have a searchInput', () => {
    expect(component.searchInput).toBeTruthy();
  });
  it('should have a searchResults', () => {
    expect(component.searchResults).toBeTruthy();
  });
  it('should have a close button', () => {
    expect(component.close).toBeTruthy();
  });
});
