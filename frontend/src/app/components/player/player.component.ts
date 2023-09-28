import {
  Component,
  OnInit,
  Input,
  Output,
  ChangeDetectorRef,
  EventEmitter,
} from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { PlaylistService } from 'src/app/services/playlist.service';
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
  @Input() playlist: any;
  @Output() currentTrackIdChange = new EventEmitter<string>();
  @Output() playlistChange = new EventEmitter<any>();
  currentTrack: any;
  currentTrackId = '';
  progress: number = 0;
  deviceId: string | null = null;
  isPlaying = false;
  isPaused: boolean | null = null;
  currentSongRank: number | null = null;

  constructor(
    private playerService: PlayerService,
    private playlistService: PlaylistService,
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

    this.createPlayerStateListener();

    this.cdr.detectChanges();

    this.socket.on('syncState', async (state: any) => {
      await this.updatePlayerState(
        state,
        state.currentTrack,
        state.currentTrackId
      );
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
        console.log('triggered next song ourselves');

        await this.playlistService.markTracksAsPlayed(
          this.playlist,
          this.currentTrackId
        );
        const playlist = await this.playlistService.updatePlaylistOrder(
          this.spotifyPlaylistId!
        );
        await this.playerService.player.nextTrack();
        this.playlistChange.emit(playlist);
      }
    } catch (error) {
      console.error('failed to play next track', error);
    }
  }

  private updatePlayerState(
    state: any,
    newTrack: any,
    newTrackId: string
  ): any {
    if (
      state.paused !== this.isPaused ||
      this.isPaused === null ||
      newTrackId !== this.currentTrackId
    ) {
      this.currentTrack = newTrack;
      this.currentTrackId = newTrackId;
      this.progress = state.position;
      this.isPlaying = !state.paused;
      this.isPaused = state.paused;

      const data = {
        currentTrackId: this.currentTrackId,
        progress: this.progress,
        isPlaying: this.isPlaying ? 1 : 0,
      };
      return data;
    }
  }

  private triggerStateChange(state: any, newTrack: any, newTrackId: string) {
    const stateData = this.updatePlayerState(state, newTrack, newTrackId);
    if (stateData) {
      this.currentTrackIdChange.emit(this.currentTrackId);
      this.socket.emit(
        'clientStateChange',
        {
          currentTrackId: stateData.currentTrackId,
          currentTrack: stateData.currentTrack,
          progress: stateData.progress,
          isPlaying: stateData.isPlaying ? 1 : 0,
        },
        this.spotifyPlaylistId
      );
    }
  }

  private async registerPlayerStateChange(state: any) {
    console.log('player_state_changed');

    // fetch current playlist and compare song order
    let newTrack = state.track_window.current_track;
    let newTrackId = newTrack.id;
    if (this.currentSongRank !== null) {
      if (this.playlist.tracks[this.currentSongRank].spotifyId === newTrackId) {
      } else if (
        this.playlist.tracks.length > this.currentSongRank + 1 &&
        this.playlist.tracks[this.currentSongRank + 1].spotifyId === newTrackId
      ) {
        this.currentSongRank += 1;
        try {
          this.triggerStateChange(state, newTrack, newTrackId);
        } catch (error) {
          console.error('Error updating current track', error);
        }
      } else {
        console.log('need to reinitialize');
        console.log('reinitialize player due to changed queue');
        const unplayedTracks = this.playlist.tracks.filter(
          (track: any) => track.played === false
        );
        if (unplayedTracks.length === 0) {
          console.log('all tracks played, hence we will set all as unplayed');
          await this.playlistService.resetTracksAsUnplayed(this.playlist);
          window.location.reload();
        } else {
          this.deviceId = await this.playerService.reconnectPlayer(
            this.spotifyPlaylistId!
          );
          console.log('new deviceId: ', this.deviceId);
          this.currentSongRank = 0;

          // reset player state listener as the old one doesn't respond anymore
          this.createPlayerStateListener();

          if (this.playlist.tracks)
            await this.playerService.playPlaylist(
              this.spotifyPlaylistId!,
              this.deviceId
            );

          let playerState;
          // TODO: increment after many failed attempts to get playerstate
          const stateQuery = setInterval(async () => {
            playerState = await this.playerService.player.getCurrentState();
            if (playerState) {
              clearInterval(stateQuery);
              newTrack = playerState.track_window.current_track;
              newTrackId = newTrack.id;
              console.log(newTrack);

              this.triggerStateChange(playerState, newTrack, newTrackId);
            }
          }, 1000);
        }
      }
    } else {
      this.currentSongRank = 0;
      try {
        this.triggerStateChange(state, newTrack, newTrackId);
      } catch (error) {
        console.error('Error updating current track', error);
      }
    }
  }

  private createPlayerStateListener() {
    this.playerService.player.addListener(
      'player_state_changed',
      async (state: any) => {
        this.registerPlayerStateChange(state);
      }
    );
  }
}
