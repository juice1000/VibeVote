import { Component, Input } from '@angular/core';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-information-window',
  templateUrl: './information-window.component.html',
  styleUrls: ['./information-window.component.css'],
})
export class InformationWindowComponent {
  @Input() playlistId: string | null = null;

  constructor(private playlistService: PlaylistService) {}
  backToLogin() {
    this.playlistService.removePlaylist(this.playlistId);
  }
}
