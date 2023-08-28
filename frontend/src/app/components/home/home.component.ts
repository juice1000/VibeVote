import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  newPlaylistName = '';
  childFriendly = false;

  constructor(
    private router: Router,
    private playlistService: PlaylistService
  ) {}

  async createPlaylist() {
    const playlist = await this.playlistService.createPlaylist(
      this.newPlaylistName,
      this.childFriendly
    );
    this.router.navigate(['/share-session', playlist.spotifyPlaylistId]);
  }
}
