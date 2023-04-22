import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-track',
  templateUrl: './add-track.component.html',
  styleUrls: ['./add-track.component.css'],
})
export class AddTrackComponent implements OnInit {
  trackName!: string;
  searchResults: any;
  playlist: any;

  constructor(
    public dialogRef: MatDialogRef<AddTrackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private playlistService: PlaylistService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const spotifyPlaylistId: any = this.data.spotifyPlaylistId;
    console.log(spotifyPlaylistId);

    this.playlistService.getPlaylistBySpotifyId(spotifyPlaylistId).subscribe(
      (playlist) => {
        this.playlist = playlist;
      },
      (error) => {
        console.error('Error fetching playlist:', error);
      }
    );
  }

  async searchTracks(): Promise<void> {
    if (this.trackName.length < 1) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const { accessToken, refreshToken, expiresIn } =
        await this.playlistService.fetchTokens(this.playlist.spotifyPlaylistId);

      if (!accessToken) {
        await this.authService.refreshAccessToken(refreshToken);
      }
      this.authService.setAccessToken(accessToken, expiresIn);

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
