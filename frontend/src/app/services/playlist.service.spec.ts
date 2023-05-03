import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { PlaylistService } from './playlist.service';
// import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
// import { MockBackend } from '@angular/http/testing';

xdescribe('PlaylistService', () => {
  let service: PlaylistService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        PlaylistService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: {
              SpotifyPlaylistId: '123',
            },
          },
        },
      ],
    });
    service = TestBed.get(PlaylistService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be create a playlist', () => {
    fakeAsync(() => {
      let response = '12345';
      service.accessToken = '123';
      service.createPlaylist('test', true);
      const req = httpTestingController.expectOne(
        'https://api.spotify.com/v1/users/123/playlists'
      );
      expect(req.request.method).toEqual('POST');
      req.flush(response);
      tick();
      console.log(service);
      expect(response).toBe('12345');
    });
  });
});
