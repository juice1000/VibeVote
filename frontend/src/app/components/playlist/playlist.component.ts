import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const spotifyPlaylistId: any =
      this.route.snapshot.paramMap.get('spotifyPlaylistId');

    this.playlistService.getPlaylistBySpotifyId(spotifyPlaylistId).subscribe(
      (playlist) => {
        this.playlist = playlist;
      },
      (error) => {
        console.error('Error fetching playlist:', error);
      }
    );
  }

  async fetchPlaylistBySpotifyId(spotifyPlaylistId: string): Promise<void> {
    try {
      this.playlist = await this.playlistService.getPlaylistBySpotifyId(
        spotifyPlaylistId
      );
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

  async fetchPlaylist(playlistId: string): Promise<void> {
    try {
      this.playlist = await this.playlistService.getPlaylist(playlistId);
      this.playlist.tracks.sort(
        (a: any, b: any) => b.votes.length - a.votes.length
      );
      this.userVotes = this.playlist.tracks.map(
        (track: any) => track.votedByUser
      );
      this.router.navigate(['/playlist', this.playlist.spotifyPlaylistId]);
    } catch (error) {
      console.error('Failed to fetch playlist', error);
    }
  }

  async vote(trackId: string, spotifyId: string, index: number): Promise<void> {
    try {
      const spotifyPlaylistId =
        this.route.snapshot.paramMap.get('spotifyPlaylistId');
      if (this.userVotes[index]) {
        await this.playlistService.deleteVote(
          spotifyPlaylistId!,
          trackId,
          spotifyId
        );
      } else {
        await this.playlistService.voteForTrack(
          spotifyPlaylistId!,
          trackId,
          spotifyId
        );
      }
      await this.fetchPlaylist(spotifyPlaylistId!);
      console.log(this.playlist.tracks);
      await this.playlistService.reorderSpotifyPlaylist(
        spotifyPlaylistId!,
        this.playlist.tracks
      );
    } catch (error) {
      console.error('Failed to vote for track', error);
    }
  }

  async addTrack(): Promise<void> {
    const spotifyPlaylistId =
      this.route.snapshot.paramMap.get('spotifyPlaylistId');
    const dialogRef = this.dialog.open(AddTrackComponent);
    const addTrackBtn = document.querySelector('.add-track-btn');
    if (addTrackBtn) {
      addTrackBtn.setAttribute('disabled', 'true');
    }

    dialogRef.afterClosed().subscribe(async (result) => {
      if (addTrackBtn) {
        addTrackBtn.removeAttribute('disabled');
      }

      if (result) {
        try {
          await this.playlistService.addTrackToPlaylist(
            spotifyPlaylistId!,
            result
          );
          this.fetchPlaylist(spotifyPlaylistId!);
        } catch (error) {
          console.error('Failed to add track to playlist', error);
        }
      }
    });
  }
}
