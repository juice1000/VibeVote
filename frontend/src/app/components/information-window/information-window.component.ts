import { Component, Input } from '@angular/core';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-information-window',
  templateUrl: './information-window.component.html',
  styleUrls: ['./information-window.component.css'],
})
export class InformationWindowComponent {
  @Input() playlistId: string = '';
  @Input() isOwner: boolean = false;

  constructor(private playlistService: PlaylistService) {}
  backToLogin() {
    this.playlistService.leaveSession(this.playlistId, this.isOwner);
  }
}
