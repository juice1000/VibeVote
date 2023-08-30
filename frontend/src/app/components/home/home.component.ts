import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { UserService } from 'src/app/services/user.service';

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
    private playlistService: PlaylistService,
    private userService: UserService
  ) {}
  async ngOnInit(): Promise<void> {
    this.spotifyUser = await this.playlistService.getSpotifyUser();
    let response;
    if (this.spotifyUser) {
      response = await this.playlistService.getUserPlaylists(
        this.spotifyUser.id
      );
      if (response.status === 404) {
        response = await this.userService.createUser(
          this.spotifyUser.id,
          this.spotifyUser.display_name
        );
      } else {
        const playlistIds: string[] = response;
        playlistIds.forEach(async (id: string) => {
          this.userPlaylists.push(
            await this.playlistService.getPlaylistFromSpotifyApi(id)
          );
        });
        console.log(this.userPlaylists);
      }
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
