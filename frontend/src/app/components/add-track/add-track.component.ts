import {
  Component,
  Output,
  EventEmitter,
  Input,
  AfterViewChecked,
  ViewChild,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-track',
  templateUrl: './add-track.component.html',
  styleUrls: ['./add-track.component.css'],
})
export class AddTrackComponent implements AfterViewChecked {
  trackName!: string;
  searchResults: any;

  @Output() close = new EventEmitter<string | null>();
  @Input() spotifyPlaylistId!: string;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Input() isVisible = false;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService,
    private http: HttpClient,
    private renderer: Renderer2
  ) {}

  ngAfterViewChecked(): void {
    if (this.isVisible) {
      this.focusInput();
    }
  }

  async searchTracks(): Promise<void> {
    if (this.trackName.length < 1) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const { accessToken, refreshToken, expiresIn } =
        await this.playlistService.fetchTokens(this.spotifyPlaylistId);

      if (!accessToken) {
        await this.authService.refreshAccessToken(refreshToken);
      }
      this.authService.setAccessToken(accessToken, expiresIn);

      const headers = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + accessToken
      );
      const encodedQuery = encodeURIComponent(this.trackName);
      const playlist = await this.playlistService.getPlaylistBySpotifyId(
        this.spotifyPlaylistId
      );

      const response: any = await this.http
        .get(`https://api.spotify.com/v1/search?type=track&q=${encodedQuery}`, {
          headers,
        })
        .toPromise();

      if (playlist.childFriendly) {
        this.searchResults = {
          ...response,
          tracks: {
            ...response.tracks,
            items: response.tracks.items.filter(
              (track: any) => !track.explicit
            ),
          },
        };
      } else {
        this.searchResults = response;
      }
    } catch (error) {
      console.error('Failed to search for tracks', error);
    }
  }

  selectTrack(uri: string): void {
    this.trackName = '';
    this.searchResults = null;
    this.close.emit(uri);
  }

  onNoClick(): void {
    this.close.emit(null);
  }

  focusInput(): void {
    this.renderer.selectRootElement(this.searchInput.nativeElement).focus();
  }
}
