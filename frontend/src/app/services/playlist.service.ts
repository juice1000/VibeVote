import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
}
