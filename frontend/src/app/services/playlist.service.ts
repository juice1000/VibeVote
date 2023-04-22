import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, map, Observable, from } from 'rxjs';
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
      const accessToken = this.accessToken;

      if (this.authService.isTokenExpired() || !accessToken) {
        console.log(accessToken);

        await this.authService.refreshAccessToken();
      }

      const userId = await this.getUserId();
      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + accessToken
      );
      console.log('Access TAAAAAKEN', accessToken);

      const spotifyPlaylist: any = await this.http
        .post(
          `${spotifyApiUrl}/users/${userId}/playlists`,
          { name: title },
          { headers }
        )
        .toPromise();

      return await firstValueFrom(
        this.http.post(`${URL}/api/playlist/create`, {
          title,
          spotifyPlaylistId: spotifyPlaylist?.id,
        })
      );
    } catch (error) {
      console.error('Failed to create playlist', error);
      throw error;
    }
  }

  async getUserId(): Promise<string> {
    try {
      const accessToken = this.accessToken;

      if (this.authService.isTokenExpired() || !accessToken) {
        await this.authService.refreshAccessToken();
      }

      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + accessToken
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
      const accessToken = this.accessToken;
      if (this.authService.isTokenExpired() || !accessToken) {
        await this.authService.refreshAccessToken();
      }

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
      const accessToken = this.accessToken;
      if (this.authService.isTokenExpired() || !accessToken) {
        await this.authService.refreshAccessToken();
      }

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
}
