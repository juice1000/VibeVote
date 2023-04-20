import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getGuestId } from '../utils/guest';
import { Observable } from 'rxjs';

const URL = 'http://localhost:3000';

const spotifyApiUrl = 'https://api.spotify.com/v1';

let authToken: string;

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  constructor(private http: HttpClient) {}

  async createPlaylist(title: string, description: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post(`${URL}/api/playlist/create`, {
          title,
          description,
        })
      );
    } catch (error) {
      console.error('Failed to create playlist', error);
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

  async addTrackToPlaylist(playlistId: string, trackId: any): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${URL}/api/playlist/${playlistId}/add-track`, {
          trackId,
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
    // userId: string | null,
    spotifyId: string
  ): Promise<void> {
    try {
      const guestId = getGuestId();
      await firstValueFrom(
        this.http.post(`${URL}/api/playlist/${playlistId}/vote`, {
          trackId,
          // userId,
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
    // userId: string | null,
    // guestId: string | null,
    spotifyId: string
  ): Promise<void> {
    try {
      const guestId = getGuestId();

      await firstValueFrom(
        this.http.post(`${URL}/api/playlist/${playlistId}/vote`, {
          trackId,
          // userId,
          guestId,
          spotifyId,
        })
      );
    } catch (error) {
      console.error('Failed to delete vote', error);
      throw error;
    }
  }

  searchTracks(query: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${authToken}`
    );
    return this.http.get<any>(
      `${spotifyApiUrl}/search?type=track&limit=10&q=${encodeURIComponent(
        query
      )}`,
      {
        headers: headers,
      }
    );
  }
}
