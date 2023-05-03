import { TestBed } from '@angular/core/testing';

import { PlayerService } from './player.service';
import { AuthService } from './auth.service';
import { PlaylistService } from './playlist.service';
import { HttpClientModule } from '@angular/common/http';

xdescribe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlayerService, AuthService, PlaylistService],
      imports: [HttpClientModule],
    });
    service = TestBed.inject(PlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
