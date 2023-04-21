import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-track',
  templateUrl: './add-track.component.html',
  styleUrls: ['./add-track.component.css'],
})
export class AddTrackComponent {
  trackName!: string;
  searchResults: any;

  constructor(
    public dialogRef: MatDialogRef<AddTrackComponent>,
    private playlistService: PlaylistService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  async searchTracks(): Promise<void> {
    if (this.trackName.length < 1) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const accessToken = this.authService.getAccessToken();
      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + accessToken
      );
      const encodedQuery = encodeURIComponent(this.trackName);
      const response = await this.http
        .get(`https://api.spotify.com/v1/search?type=track&q=${encodedQuery}`, {
          headers,
        })
        .toPromise();
      this.searchResults = response;
    } catch (error) {
      console.error('Failed to search for tracks', error);
    }
  }

  selectTrack(uri: string): void {
    this.dialogRef.close(uri);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
