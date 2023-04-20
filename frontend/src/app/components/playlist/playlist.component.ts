import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
})
export class PlaylistComponent implements OnInit {
  playlist: any;

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('id');
    this.fetchPlaylist(sessionId!);
  }

  async fetchPlaylist(sessionId: string): Promise<void> {
    try {
      this.playlist = await this.playlistService.getPlaylist(sessionId);
    } catch (error) {
      console.error('Failed to fetch playlist', error);
    }
  }

  vote(trackId: string): void {
    console.log('Vote for track', trackId);
    // Call the API to vote for the track
  }

  addTrack(): void {
    console.log('Add track');
    // Call the API to add a new track to the playlist
  }
}
