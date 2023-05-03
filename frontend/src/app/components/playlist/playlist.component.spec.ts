import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistComponent } from './playlist.component';
import { PlaylistService } from 'src/app/services/playlist.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

class MockPlayListService extends PlaylistService {
  createPlayList() {
    return {
      childFriendly: true,
      createdAt: '2023-05-01T14:02:15.255Z',
      description: null,
      id: 11,
      spotifyAccessToken: null,
      spotifyPlaylistId: '6fhNCRL0G73vnEJ88GET81',
      spotifyRefreshToken: null,
      spotifyTokenExpiresAt: null,
      title: 'test',
      updatedAt: '2023-05-01T14:02:15.255Z',
    };
  }
}
xdescribe('PlaylistComponent', () => {
  let component: PlaylistComponent;
  let fixture: ComponentFixture<PlaylistComponent>;
  let testBedService: PlaylistService;
  // const fakeActivatedRoute = {
  //   snapshot: { data: { SpotifyPlaylistId: '123' } },
  // } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaylistComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        // DebugElement,
        // HttpClient,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        // HttpClient,
        MockPlayListService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ spotifyPlaylistId: '123' }),
            },
          },
        },
        // PlaylistService,
        ChangeDetectorRef,
      ],
    }).compileComponents();

    TestBed.overrideComponent(PlaylistComponent, {
      set: {
        providers: [
          {
            provide: 'playlistService',
            useClass: MockPlayListService,
          },
        ],
      },
    });
    fixture = await TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // const actiavtedRoute = TestBed.inject(ActivatedRoute);
    console.log('component', component);
    expect(component).toBeTruthy();
  });
});
