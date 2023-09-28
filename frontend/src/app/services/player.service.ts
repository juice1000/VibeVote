import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PlaylistService } from './playlist.service';

declare global {
  interface Window {
    Spotify: any;
  }
}
declare var Spotify: any;

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  player: any;

  constructor(
    private authService: AuthService,
    private playlistService: PlaylistService
  ) {}

  async initializePlayer(playlistId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.player) {
        resolve(this.player);
        return;
      }

      let accessToken: any;
      accessToken = this.authService.getAccessToken();
      if (!accessToken) {
        const tokenObject = await this.playlistService.fetchTokens(playlistId);
        accessToken = tokenObject.accessToken;
      }

      if (!window.Spotify) {
        setTimeout(async () => {
          const player = await this.initializePlayer('');
          resolve(player);
        }, 1000);
        return;
      }

      this.player = new Spotify.Player({
        name: 'Web App Player',
        getOAuthToken: (cb: (accessToken: string) => void) => {
          cb(accessToken!);
        },
      });
      this.player.addListener('ready', ({ device_id }: any) => {
        resolve(device_id);
      });

      this.player.addListener('not_ready', ({ device_id }: any) => {
        console.error('Device ID has gone offline', device_id);
        reject();
      });

      this.player.connect();
    });
  }

  async play(spotifyUri: string, playlistId?: string): Promise<void> {
    let accessToken;
    accessToken = await this.authService.getAccessToken();
    if (!accessToken) {
      const tokenObject = await this.playlistService.fetchTokens(playlistId!);
      accessToken = tokenObject.accessToken;
    }

    if (this.player) {
      // console.log(this.player);

      const deviceId = this.player._options.id;
      const uri = encodeURIComponent(spotifyUri);

      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri] }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } else {
      console.error('Player not initialized');
    }
  }

  async togglePlay(): Promise<void> {
    if (this.player) {
      this.player.togglePlay();
    } else {
      console.error('Player not initialized');
    }
  }

  async disconnectPlayer(): Promise<void> {
    this.player.disconnect();
  }
  async reconnectPlayer(playlistId: string): Promise<any> {
    this.player.removeListener('player_state_changed');
    await this.player.disconnect();
    this.player = null;
    return await this.initializePlayer(playlistId);
  }

  async nextTrack(): Promise<void> {
    if (this.player) {
      // we need a list of the current rating and play the next song on it
      this.player.nextTrack();
    } else {
      console.error('Player not initialized');
    }
  }

  async previousTrack(): Promise<void> {
    if (this.player) {
      this.player.previousTrack();
    } else {
      console.error('Player not initialized');
    }
  }
  async playPlaylist(
    spotifyPlaylistId: string,
    deviceId: string | null
  ): Promise<boolean> {
    try {
      let accessToken;
      accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        const { accessToken } = await this.playlistService.fetchTokens(
          spotifyPlaylistId
        );
      }

      if (deviceId && this.player) {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              context_uri: `spotify:playlist:${spotifyPlaylistId}`,
            }),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error('Player not initialized or deviceId is null');
          return false;
        }
        return true;
      } else {
        console.error('Player not initialized or deviceId is null');
      }
    } catch (error) {
      console.error('Error in playPlaylist:', error);
    }
    return false;
  }
}
