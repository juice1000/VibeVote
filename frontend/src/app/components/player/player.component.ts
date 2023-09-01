import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-spotify-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
})
export class PlayerComponent implements OnInit {
  @Input() spotifyPlaylistId: string | null = null;
  @Input() isOwner: boolean = false;
  @Input() initialState: any;
  currentTrack: any;
  currentTrackId = '';
  progress: number = 0;
  deviceId: string | null = null;
  isPlaying = false;
  isPaused: boolean | null = null;

  constructor(
    private playerService: PlayerService,
    private cdr: ChangeDetectorRef,
    private socket: Socket
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadSpotifyPlayerScript();

    if (!this.spotifyPlaylistId) {
      console.error('No Spotify playlist ID provided');
      return;
    }

    this.deviceId = await this.playerService.initializePlayer(
      this.spotifyPlaylistId
    );

    this.playerService.player.addListener(
      'player_state_changed',
      async (state: any) => {
        try {
          if (state.paused !== this.isPaused || this.isPaused === null) {
            this.currentTrack = state.track_window.current_track;
            this.currentTrackId = state.track_window.current_track.id;
            this.progress = state.position;
            this.isPlaying = !state.paused;
            this.isPaused = state.paused;

            this.socket.emit(
              'clientStateChange',
              {
                currentTrackId: this.currentTrackId,
                progress: this.progress,
                isPlaying: this.isPlaying ? 1 : 0,
              },
              this.spotifyPlaylistId
            );
            this.cdr.detectChanges();
          }
        } catch (error) {
          console.error('Error updating current track', error);
        }
      }
    );
    this.socket.on('syncState', async (state: any) => {
      await this.updatePlayerState(state);
      this.isPlaying = state.isPlaying;
    });

    if (this.initialState) {
      this.currentTrackId = this.initialState.currentTrackId;
      this.progress = this.initialState.progress;
      console.log(
        'initial state',
        this.initialState.isPlaying,
        this.initialState
      );
      this.isPlaying = this.initialState.isPlaying;

      if (this.initialState.isPlaying) {
        await this.playerService.play(
          `spotify:track:${this.currentTrackId}`,
          this.spotifyPlaylistId!
        );
      }
    }

    const playerState = await this.playerService.player.getCurrentState();
    if (playerState && playerState.track_window) {
      this.currentTrack = playerState.track_window.current_track;
      this.progress = playerState.position;
    }
  }

  private loadSpotifyPlayerScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).Spotify) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async play(): Promise<void> {
    try {
      if (!this.currentTrack) {
        if (this.spotifyPlaylistId) {
          await this.playerService.playPlaylist(
            this.spotifyPlaylistId,
            this.deviceId
          );
        } else {
          console.error('No track or playlist to play');
        }
      } else {
        if (this.playerService.player) {
          await this.playerService.player.resume();
          this.isPlaying = true;
        }
      }
    } catch (error) {
      console.error('Failed to play track/playlist', error);
    }
  }

  async pause(): Promise<void> {
    try {
      if (this.playerService.player) {
        await this.playerService.player.pause();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Failed to pause track', error);
    }
  }

  async next(): Promise<void> {
    try {
      if (this.playerService.player) {
        await this.playerService.player.nextTrack();
      }
    } catch (error) {
      console.error('failed to play next track', error);
    }
  }

  private async updatePlayerState(state: any): Promise<void> {
    try {
      // console.log('state', state);

      this.currentTrack = state.currentTrack;
      this.progress = state.position;
    } catch (error) {
      console.error('Error updating player state', error);
    }
  }
}
