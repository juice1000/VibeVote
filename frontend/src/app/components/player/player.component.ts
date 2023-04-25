import { Component, OnInit, Input } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

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

  constructor(private playerService: PlayerService) {}

  async ngOnInit(): Promise<void> {
    (window as any).onSpotifyWebPlaybackSDKReady = () => {};
    this.loadSpotifyPlayerScript();

    if (!this.spotifyPlaylistId) {
      console.error('No Spotify playlist ID provided');
      return;
    }

    this.deviceId = await this.playerService.initializePlayer(
      this.spotifyPlaylistId
    );
    socket.emit('requestInitialState');

    this.playerService.player.addListener(
      'player_state_changed',
      async (state: any) => {
        try {
          this.currentTrack = state.track_window.current_track;
          this.progress = state.position;

          socket.emit('clientStateChange', {
            playlistId: this.spotifyPlaylistId,
            currentTrack: this.currentTrack,
            progress: this.progress,
            isPlaying: !state.paused,
          });
          socket.emit('updateState', { state });
        } catch (error) {
          console.error('Error updating current track', error);
        }
      }
    );

    socket.on('syncState', async (state) => {
      console.log('socket on syncstate state:', state);

      await this.updatePlayerState(state);
    });
    socket.on('initialState', async (state: any) => {
      try {
        if (this.spotifyPlaylistId === state.playlistId) {
          console.log('Initial player state received', state);
          this.currentTrack = state.currentTrack;
          this.progress = state.progress;

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

  private loadSpotifyPlayerScript(): void {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  async play(): Promise<void> {
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
      await this.playerService.play(
        `spotify:track:${this.currentTrack.id}`,
        this.spotifyPlaylistId!
      );
    }
  }

  async pause(): Promise<void> {
    if (this.playerService.player) {
      this.playerService.player.pause();
    }
  }

  async next(): Promise<void> {
    if (this.playerService.player) {
      this.playerService.player.nextTrack();
    }
  }

  private async updatePlayerState(state: any): Promise<void> {
    try {
      console.log('sync state received', state);
      this.currentTrack = state.track_window.current_track;
      this.progress = state.position;
    } catch (error) {
      console.error('Error updating player state', error);
    }
  }
}
