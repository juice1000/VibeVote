import { Component, OnInit } from '@angular/core';
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
  spotifyUser: any;
  userPlaylists: any[] = [];

  constructor(
    private router: Router,
    private playlistService: PlaylistService
  ) {}
  async ngOnInit(): Promise<void> {
    this.spotifyUser = await this.playlistService.getSpotifyUser();
    console.log(this.spotifyUser);

    if (this.spotifyUser) {
      this.userPlaylists = await this.playlistService.getUserPlaylists(
        this.spotifyUser.id
      );
    }
  }
  async createPlaylist() {
    const playlist = await this.playlistService.createPlaylist(
      this.newPlaylistName,
      this.childFriendly
    );
    this.router.navigate(['/share-session', playlist.spotifyPlaylistId]);
  }
}
