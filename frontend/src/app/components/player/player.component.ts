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
  currentTrack: any;
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
    console.log(this.deviceId);

    this.socket.emit('requestInitialState');

    this.playerService.player.addListener(
      'player_state_changed',
      async (state: any) => {
        try {
          if (state.paused !== this.isPaused || this.isPaused === null) {
            this.currentTrack = state.track_window.current_track;
            this.progress = state.position;
            this.isPlaying = !state.paused;
            this.isPaused = state.paused;
            const isPlaying = this.isPlaying;

            this.socket.emit('clientStateChange', {
              playlistId: this.spotifyPlaylistId,
              currentTrack: this.currentTrack,
              progress: this.progress,
              isPlaying: this.isPlaying,
            });
            this.socket.emit('updateState', { state, isPlaying });
            this.cdr.detectChanges();
          }
        } catch (error) {
          console.error('Error updating current track', error);
        }
      }
    );

    this.socket.on(
      'syncState',
      async ({ state, isPlaying }: { state: any; isPlaying: boolean }) => {
        await this.updatePlayerState(state);
        this.isPlaying = isPlaying;
      }
    );

    this.socket.on('initialState', async (state: any) => {
      try {
        if (this.spotifyPlaylistId === state.playlistId) {
          this.currentTrack = state.currentTrack;
          this.progress = state.progress;
          console.log('initial state', state.isPlaying);
          this.isPlaying = state.isPlaying;

          if (state.isPlaying) {
            await this.playerService.play(
              `spotify:track:${this.currentTrack.id}`,
              this.spotifyPlaylistId!
            );
          }
        }
      } catch (error) {
        console.error('Error setting initial player state', error);
      }
    });
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
      this.currentTrack = state.track_window.current_track;
      this.progress = state.position;
    } catch (error) {
      console.error('Error updating player state', error);
    }
  }
}
