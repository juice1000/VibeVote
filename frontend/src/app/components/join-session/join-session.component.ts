import { Component } from '@angular/core';
import { PlaylistService } from 'src/app/services/playlist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styleUrls: ['./join-session.component.css'],
})
export class JoinSessionComponent {
  playlistId!: string;

  constructor(
    private playlistService: PlaylistService,
    private router: Router
  ) {}

  async redirectToPlaylist() {
    // sanitize input
    // 1pQhXVaS08YJ0WDApUWYjk

    const re = new RegExp('[a-zA-Z0-9]{22}');
    const res = this.playlistId.match(re);
    console.log(res);
    if (res && res[0] === this.playlistId) {
      // check if playlist exists + check if playlist active
      const isActive = await this.playlistService.isActivePlaylist(
        this.playlistId
      );

      console.log(isActive);
      if (isActive) {
        // redirect
        this.router.navigate(['/playlist', this.playlistId]);
      } else {
        alert(`Seems like this Party is not active right now`);
      }
    } else {
      alert(`Seems like you didn't enter a valid playlist Id`);
    }
  }
}
