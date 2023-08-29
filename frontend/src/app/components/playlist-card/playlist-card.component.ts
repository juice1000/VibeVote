import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-playlist-card',
  templateUrl: './playlist-card.component.html',
  styleUrls: ['./playlist-card.component.css'],
})
export class PlaylistCardComponent {
  @Input() spotifyUser: any;
}
