import { TestBed } from '@angular/core/testing';

import { PlayerService } from './player.service';
import { AuthService } from './auth.service';
import { PlaylistService } from './playlist.service';

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlayerService, AuthService, PlaylistService],
    });
    service = TestBed.inject(PlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
