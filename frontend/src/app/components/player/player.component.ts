import { Component, OnInit, Input } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';

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

    this.deviceId = await this.playerService.initializePlayer();

    this.playerService.player.addListener(
      'player_state_changed',
      (state: any) => {
        try {
          console.log('Player state changed', state);
          this.currentTrack = state.track_window.current_track;
          this.progress = state.position;
          console.log('Updated current track', this.currentTrack);
        } catch (error) {
          console.error('Error updating current track', error);
        }
      }
    );
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
    console.log('currenttrack in play', this.currentTrack);

    if (!this.currentTrack) {
      if (this.spotifyPlaylistId) {
        console.log('deviceid in play in component', this.deviceId);
        console.log('Playing playlist', this.spotifyPlaylistId);
        await this.playerService.playPlaylist(
          this.spotifyPlaylistId,
          this.deviceId
        );
      } else {
        console.error('No track or playlist to play');
      }
    } else {
      console.log('Playing track', this.currentTrack);
      await this.playerService.play(`spotify:track:${this.currentTrack.id}`);
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
}
