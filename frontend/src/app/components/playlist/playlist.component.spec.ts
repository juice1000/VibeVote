import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistComponent } from './playlist.component';
import { PlaylistService } from 'src/app/services/playlist.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

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
describe('PlaylistComponent', () => {
  let component: PlaylistComponent;
  let fixture: ComponentFixture<PlaylistComponent>;
  let testBedService: PlaylistService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaylistComponent],
      imports: [RouterTestingModule, HttpClientModule, DebugElement],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [MockPlayListService],
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
    expect(component).toBeTruthy();
  });
});
