import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { getGuestId } from '../utils/guest';
import { AuthService } from './auth.service';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../environments/environment';

const URL = environment.serverUrl;
const spotifyApiUrl = 'https://api.spotify.com/v1';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  accessToken = this.authService.getAccessToken();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private socket: Socket,
    private router: Router
  ) {}

  async createPlaylist(title: string, childFriendly: boolean): Promise<any> {
    try {
      if (this.authService.isTokenExpired() || !this.accessToken) {
        await this.authService.refreshAccessToken();
        this.accessToken = this.authService.getAccessToken();
      }

      const user = await this.getSpotifyUser();
      const userId = user.id;
      const ownerId = getGuestId();
      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this.accessToken
      );

      const spotifyPlaylist: any = await firstValueFrom(
        this.http.post(
          `${spotifyApiUrl}/users/${userId}/playlists`,
          { name: title },
          { headers }
        )
      );

      const backendPlaylist: any = await firstValueFrom(
        this.http.post(`${URL}/api/playlist/create`, {
          title,
          spotifyPlaylistId: spotifyPlaylist?.id,
          childFriendly,
          userId,
        })
      );

      await this.updateTokens(
        backendPlaylist.spotifyPlaylistId,
        this.accessToken!,
        this.authService.getRefreshToken()!,
        (this.authService.getExpirationTime()! - Date.now()) / 1000
      );
      console.log('backendPlaylist', backendPlaylist);

      this.socket.emit(
        'createdPlaylist',
        backendPlaylist.spotifyPlaylistId,
        ownerId
      );
      return backendPlaylist;
    } catch (error) {
      console.error('Failed to create playlist', error);
      throw error;
    }
  }

  async removePlaylist(playlistId: string | null): Promise<any> {
    if (!playlistId) {
      console.error('no playlist id provided, redirecting to login');
      this.router.navigate(['/login']);
    }
    try {
      if (this.authService.isTokenExpired() || !this.accessToken) {
        await this.authService.refreshAccessToken();
        this.accessToken = this.authService.getAccessToken();
      }

      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this.accessToken
      );

      await firstValueFrom(
        this.http.delete(`${spotifyApiUrl}/playlists/${playlistId}/followers`, {
          headers,
        })
      );

      const user = await this.getSpotifyUser();
      const userId = user.id;
      await firstValueFrom(
        this.http.post(`${URL}/api/playlist/delete-playlist`, {
          playlistId,
          userId,
        })
      );
      this.router.navigate(['/login']);
    } catch (err: any) {
      if (
        err.status === 404 &&
        err.error.message === 'Playlist already deleted'
      ) {
        // redirect to login page
        this.router.navigate(['/login']);
      } else {
        console.error('Error deleting the playlist: ', err);
      }
    }
  }

  async leaveSession(playlistId: string) {
    const guestId = getGuestId();
    this.socket.emit('leaveSession', playlistId, guestId);
    // redirect to login page
    this.router.navigate(['/login']);
  }

  async getSpotifyUser(): Promise<any> {
    try {
      if (this.authService.isTokenExpired() || !this.accessToken) {
        await this.authService.refreshAccessToken();
        // this.accessToken = this.authService.getAccessToken();
      }

      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this.accessToken
      );
      const response: any = await firstValueFrom(
        this.http.get(`${spotifyApiUrl}/me`, { headers })
      );
      return response;
    } catch (error) {
      console.error('Failed to get user ID', error);
      throw error;
    }
  }

  async isOwner(playlistId: string): Promise<boolean> {
    try {
      const ownerId = await firstValueFrom(
        this.http.get<any>(`${URL}/api/playlist/${playlistId}/get-owner`)
      );
      const guestId = getGuestId();
      return guestId === ownerId;
    } catch (error) {
      console.error('Failed to get playlist by Spotify ID', error);
      throw error;
    }
  }

  async getPlaylistBySpotifyId(
    playlistId: string,
    played?: boolean
  ): Promise<any> {
    try {
      let queryParams = '';
      if (played !== undefined) {
        queryParams = `?played=${played}`;
      }

      return await firstValueFrom(
        this.http.get<any>(`${URL}/api/playlist/${playlistId}${queryParams}`)
      );
    } catch (error) {
      console.error('Failed to get playlist by Spotify ID', error);
      throw error;
    }
  }

  async getPlaylistFromSpotifyApi(playlistId: string): Promise<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.accessToken
    );
    return await firstValueFrom(
      this.http.get<any>(`${spotifyApiUrl}/playlists/${playlistId}`, {
        headers,
      })
    );
  }

  async getUserPlaylists(userId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get<any>(`${URL}/api/user/${userId}/playlists`)
      );
    } catch (error) {
      return error;
    }
  }

  async addTrackToPlaylist(playlistId: string, trackId: any): Promise<void> {
    try {
      const { accessToken, refreshToken, expiresIn } = await this.fetchTokens(
        playlistId
      );

      if (!accessToken) {
        await this.authService.refreshAccessToken(refreshToken);
      }
      this.authService.setAccessToken(accessToken, expiresIn);

      const spotifyPlaylist: any = await this.getPlaylistBySpotifyId(
        playlistId,
        false
      );
      const spotifyPlaylistId = spotifyPlaylist.spotifyPlaylistId;

      await firstValueFrom(
        this.http.post(`${URL}/api/playlist/${spotifyPlaylistId}/add-track`, {
          trackId,
          accessToken,
        })
      );
      const guestId = getGuestId();
      this.socket.emit('trackAdded', spotifyPlaylistId, trackId, guestId);
    } catch (error) {
      console.error('Failed to add track to playlist', error);
      throw error;
    }
  }

  async voteForTrack(
    playlistId: string,
    trackId: string,
    spotifyId: string
  ): Promise<void> {
    try {
      const guestId = getGuestId();
      await firstValueFrom(
        this.http.post(`${URL}/api/playlist/${playlistId}/vote`, {
          trackId,
          guestId,
          spotifyId,
        })
      );
      this.socket.emit('voteUpdated', playlistId, trackId, guestId);
    } catch (error) {
      console.error('Failed to vote for track', error);
      throw error;
    }
  }

  async updateTokens(
    playlistId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`${URL}/api/playlist/${playlistId}/tokens`, {
          accessToken,
          refreshToken,
          expiresIn,
        })
      );
    } catch (error) {
      console.error('Error updating tokens', error);
    }
  }

  async fetchTokens(
    playlistId: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${URL}/api/playlist/${playlistId}/tokens`)
      );

      const expiresIn = response.spotifyTokenExpiresAt
        ? Math.floor(
            (new Date(response.spotifyTokenExpiresAt).getTime() - Date.now()) /
              1000
          )
        : 0;

      return {
        accessToken: response.spotifyAccessToken,
        refreshToken: response.spotifyRefreshToken,
        expiresIn,
      };
    } catch (error) {
      console.error('Error fetching tokens', error);
      throw error;
    }
  }

  async updatePlaylistOrder(playlistId: string): Promise<void> {
    try {
      const { accessToken, refreshToken, expiresIn } = await this.fetchTokens(
        playlistId
      );

      if (!accessToken) {
        await this.authService.refreshAccessToken(refreshToken);
      }
      this.authService.setAccessToken(accessToken, expiresIn);

      const playlist: any = await this.getPlaylistBySpotifyId(playlistId);

      const playedTracks = playlist.tracks.filter((track: any) => track.played);
      const unplayedTracks = playlist.tracks.filter(
        (track: any) => !track.played
      );

      const sortedUnplayedTracks = unplayedTracks.sort((a: any, b: any) => {
        return b.votes.length - a.votes.length;
      });

      let currentlyPlayingTrack = null;
      try {
        currentlyPlayingTrack = await this.getCurrentlyPlayingTrack(playlistId);
      } catch (error) {
        console.error('Failed to get currently playing track', error);
      }

      if (currentlyPlayingTrack) {
        const currentlyPlayingTrackId = currentlyPlayingTrack?.id;

        const playingTrackIndex = playedTracks.findIndex(
          (track: any) => track.spotifyId === currentlyPlayingTrackId
        );

        if (playingTrackIndex !== -1) {
          const [playingTrack] = playedTracks.splice(playingTrackIndex, 1);
          playedTracks.push(playingTrack);
        }
      }
      const sortedPlaylistTracks = [...playedTracks, ...sortedUnplayedTracks];

      const trackUris = sortedPlaylistTracks.map(
        (track: any) => `spotify:track:${track.spotifyId}`
      );

      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + accessToken
      );

      await firstValueFrom(
        this.http.put(
          `${spotifyApiUrl}/playlists/${playlistId}/tracks`,
          { uris: trackUris },
          { headers }
        )
      );

      return sortedUnplayedTracks;
    } catch (error) {
      console.error('Failed to update playlist order', error);
    }
  }

  async getCurrentlyPlayingTrack(playlistId: string): Promise<any> {
    try {
      const { accessToken, refreshToken, expiresIn } = await this.fetchTokens(
        playlistId
      );

      if (!accessToken) {
        await this.authService.refreshAccessToken(refreshToken);
      }
      this.authService.setAccessToken(accessToken, expiresIn);

      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + accessToken
      );
      const response: any = await firstValueFrom(
        this.http.get(`${spotifyApiUrl}/me/player/currently-playing`, {
          headers,
        })
      );
      return response.item;
    } catch (error) {
      console.error('Failed to get currently playing track', error);
      throw error;
    }
  }

  async markTracksAsPlayed(playlistId: string): Promise<void> {
    try {
      const playlist: any = await this.getPlaylistBySpotifyId(
        playlistId,
        false
      );
      const currentlyPlayingTrack = await this.getCurrentlyPlayingTrack(
        playlistId
      );
      const currentlyPlayingTrackId = currentlyPlayingTrack?.id;

      for (const track of playlist.tracks) {
        if (track.spotifyId === currentlyPlayingTrackId) {
          if (!track.played) {
            track.played = true;
            await this.updateTrackPlayedStatus(playlistId, track.id, true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to mark tracks as played', error);
    }
  }

  async updateTrackPlayedStatus(
    playlistId: string,
    trackId: number,
    played: boolean
  ): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.put(
          `${URL}/api/playlist/${playlistId}/update-track-played-status/${trackId}`,
          { played }
        )
      );
    } catch (error) {
      console.error('Failed to updateTrackPlayedStatus', error);
      throw error;
    }
  }
}
