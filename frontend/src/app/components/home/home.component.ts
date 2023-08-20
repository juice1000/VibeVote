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
    console.log('create method called ');
    const playlist = await this.playlistService.createPlaylist(
      this.newPlaylistName,
      this.childFriendly
    );
    // socket.emit('clientStateChange', {
    //   playlistId: playlist.spotifyPlaylistId,
    //   currentTrack: '',
    //   progress: '',
    //   isPlaying: '',
    // });

    this.router.navigate(['/playlist', playlist.spotifyPlaylistId]);
  }
}
