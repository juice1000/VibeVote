import { Component, Input } from '@angular/core';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-playlist-card',
  templateUrl: './playlist-card.component.html',
  styleUrls: ['./playlist-card.component.css'],
})
export class PlaylistCardComponent {
  @Input() playlist: any;

  constructor(private playlistService: PlaylistService) {}

  loadPlaylist() {
    this.playlistService.loadPlaylist(this.playlist.id);
  }
}
