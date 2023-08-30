import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playlist-card',
  templateUrl: './playlist-card.component.html',
  styleUrls: ['./playlist-card.component.css'],
})
export class PlaylistCardComponent {
  @Input() playlist: any;

  constructor(private router: Router) {}

  redirectToPlaylistComponent() {
    this.router.navigate(['/playlist', this.playlist.id]);
  }
}
