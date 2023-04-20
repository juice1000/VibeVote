import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getGuestId } from '../utils/guest';

const BASE_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  constructor(private http: HttpClient) {}

  async getPlaylist(sessionId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get(`${BASE_URL}/api/playlist/${sessionId}`)
      );
    } catch (error) {
      console.error('Failed to get playlist', error);
      throw error;
    }
  }

  async voteForTrack(
    sessionId: string,
    trackId: string,
    spotifyId: string
  ): Promise<void> {
    try {
      const guestId = getGuestId();
      await firstValueFrom(
        this.http.post(
          `${BASE_URL}/api/playlist/${sessionId}/tracks/${trackId}/vote`,
          { trackId, guestId, spotifyId }
        )
      );
    } catch (error) {
      console.error('Failed to vote for track', error);
      throw error;
    }
  }
}
