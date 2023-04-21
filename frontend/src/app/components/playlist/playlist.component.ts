import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AddTrackComponent } from '../add-track/add-track.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
})
export class PlaylistComponent implements OnInit {
  playlist: any;
  userVotes: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const playlistId = this.route.snapshot.paramMap.get('id');
    this.fetchPlaylist(playlistId!);
  }

  async fetchPlaylist(playlistId: string): Promise<void> {
    try {
      this.playlist = await this.playlistService.getPlaylist(playlistId);
      this.playlist.tracks.sort(
        (a: any, b: any) => b.votes.length - a.votes.length
      );
      this.userVotes = this.playlist.tracks.map(
        (track: any) => track.votedByUser
      );
    } catch (error) {
      console.error('Failed to fetch playlist', error);
    }
  }

  async vote(trackId: string, spotifyId: string, index: number): Promise<void> {
    try {
      const playlistId = this.route.snapshot.paramMap.get('id');
      if (this.userVotes[index]) {
        await this.playlistService.deleteVote(playlistId!, trackId, spotifyId);
      } else {
        await this.playlistService.voteForTrack(
          playlistId!,
          trackId,
          spotifyId
        );
      }
      await this.fetchPlaylist(playlistId!);

      await this.playlistService.reorderSpotifyPlaylist(
        playlistId!,
        this.playlist.tracks
      );
    } catch (error) {
      console.error('Failed to vote for track', error);
    }
  }

  async addTrack(): Promise<void> {
    const playlistId = this.route.snapshot.paramMap.get('id');
    const dialogRef = this.dialog.open(AddTrackComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.playlistService.addTrackToPlaylist(playlistId!, result);
          this.fetchPlaylist(playlistId!);
        } catch (error) {
          console.error('Failed to add track to playlist', error);
        }
      }
    });
  }
}
