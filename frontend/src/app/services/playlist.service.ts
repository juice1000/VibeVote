import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable, from } from 'rxjs';
import { getGuestId } from '../utils/guest';
import { AuthService } from './auth.service';

const URL = 'http://localhost:3000';

const spotifyApiUrl = 'https://api.spotify.com/v1';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  accessToken = this.authService.getAccessToken();
  constructor(private http: HttpClient, private authService: AuthService) {}

  async createPlaylist(title: string): Promise<any> {
    try {
      if (this.authService.isTokenExpired() || !this.accessToken) {
        await this.authService.refreshAccessToken();
        this.accessToken = this.authService.getAccessToken();
      }

      const userId = await this.getUserId();
      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this.accessToken
      );

      const spotifyPlaylist: any = await this.http
        .post(
          `${spotifyApiUrl}/users/${userId}/playlists`,
          { name: title },
          { headers }
        )
        .toPromise();

      const backendPlaylist: any = await firstValueFrom(
        this.http.post(`${URL}/api/playlist/create`, {
          title,
          spotifyPlaylistId: spotifyPlaylist?.id,
        })
      );

      await this.updateTokens(
        backendPlaylist.spotifyPlaylistId,
        this.accessToken!,
        this.authService.getRefreshToken()!,
        (this.authService.getExpirationTime()! - Date.now()) / 1000
      );

      return backendPlaylist;
    } catch (error) {
      console.error('Failed to create playlist', error);
      throw error;
    }
  }

  async getUserId(): Promise<string> {
    try {
      if (this.authService.isTokenExpired() || !this.accessToken) {
        await this.authService.refreshAccessToken();
        this.accessToken = this.authService.getAccessToken();
      }

      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this.accessToken
      );
      const response: any = await this.http
        .get(`${spotifyApiUrl}/me`, { headers })
        .toPromise();
      return response.id;
    } catch (error) {
      console.error('Failed to get user ID', error);
      throw error;
    }
  }

  async getPlaylist(playlistId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get(`${URL}/api/playlist/${playlistId}`)
      );
    } catch (error) {
      console.error('Failed to get playlist', error);
      throw error;
    }
  }

  getPlaylistBySpotifyId(playlistId: string): Observable<any> {
    return from(
      this.http.get<any>(`${URL}/api/playlist/${playlistId}`).toPromise()
    );
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
        playlistId
      ).toPromise();
      const spotifyPlaylistId = spotifyPlaylist.spotifyPlaylistId;

      await firstValueFrom(
        this.http.post(`${URL}/api/playlist/${spotifyPlaylistId}/add-track`, {
          trackId,
          accessToken,
        })
      );
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
    } catch (error) {
      console.error('Failed to vote for track', error);
      throw error;
    }
  }

  async deleteVote(
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
    } catch (error) {
      console.error('Failed to delete vote', error);
      throw error;
    }
  }

  async reorderSpotifyPlaylist(
    playlistId: string,
    rangeStart: number,
    insertBefore: number
  ): Promise<void> {
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

      await this.http
        .put(
          `${spotifyApiUrl}/playlists/${playlistId}/tracks`,
          { range_start: rangeStart, insert_before: insertBefore },
          { headers }
        )
        .toPromise();
    } catch (error) {
      console.error('Failed to reorder Spotify playlist', error);
      throw error;
    }
  }

  async reorderTracks(playlistId: string): Promise<void> {
    try {
      const playlist = await this.getPlaylist(playlistId);

      const sortedTracks = [...playlist.tracks].sort(
        (a: any, b: any) => b.votes.length - a.votes.length
      );

      for (let i = 0; i < playlist.tracks.length; i++) {
        const currentPosition = playlist.tracks.findIndex(
          (track: any) => track.trackId === sortedTracks[i].trackId
        );

        if (i !== currentPosition) {
          await this.reorderSpotifyPlaylist(
            playlist.spotifyPlaylistId,
            currentPosition,
            i
          );
        }
      }
    } catch (error) {
      console.error('Failed to reorder tracks', error);
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
      await this.http
        .put(`${URL}/api/playlist/${playlistId}/tokens`, {
          accessToken,
          refreshToken,
          expiresIn,
        })
        .toPromise();
    } catch (error) {
      console.error('Error updating tokens', error);
    }
  }

  async fetchTokens(
    playlistId: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const response: any = await this.http
        .get(`${URL}/api/playlist/${playlistId}/tokens`)
        .toPromise();

      const expiresIn = response.spotifyTokenExpiresAt
        ? Math.floor(
            (new Date(response.spotifyTokenExpiresAt).getTime() - Date.now()) /
              1000
          )
        : 0;
      console.log('response in fetchtokens', response.spotifyTokenExpiresAt);
      console.log('expires in fetchtokens', expiresIn);

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
}
