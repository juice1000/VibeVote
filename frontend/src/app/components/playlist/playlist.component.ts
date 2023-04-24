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

  async ngOnInit(): Promise<void> {
    const spotifyPlaylistId: any =
      this.route.snapshot.paramMap.get('spotifyPlaylistId');

    try {
      this.playlist = await this.playlistService.getPlaylistBySpotifyId(
        spotifyPlaylistId
      );
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  }

  async fetchPlaylistBySpotifyId(spotifyPlaylistId: string): Promise<void> {
    try {
      this.playlist = await this.playlistService.getPlaylistBySpotifyId(
        spotifyPlaylistId
      );

      this.playlist.tracks.sort((a: any, b: any) => {
        if (a.played && !b.played) {
          return -1;
        } else if (!a.played && b.played) {
          return 1;
        } else if (a.played && b.played) {
          return 0;
        } else {
          return b.votes.length - a.votes.length;
        }
      });
      this.userVotes = this.playlist.tracks.map(
        (track: any) => track.votedByUser
      );
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
      await this.playlistService.markTracksAsPlayed(spotifyPlaylistId!);
      await this.playlistService.updatePlaylistOrder(spotifyPlaylistId!);

      await this.fetchPlaylistBySpotifyId(spotifyPlaylistId!);

      console.log(
        'playlist.tracks inside of vote in playlist component',
        this.playlist.tracks
      );
    } catch (error) {
      console.error('Failed to vote for track', error);
    }
  }

  async addTrack(): Promise<void> {
    const spotifyPlaylistId =
      this.route.snapshot.paramMap.get('spotifyPlaylistId');
    const dialogRef = this.dialog.open(AddTrackComponent, {
      data: { spotifyPlaylistId },
    });
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
          await this.playlistService.markTracksAsPlayed(spotifyPlaylistId!);
          await this.playlistService.updatePlaylistOrder(spotifyPlaylistId!);
          await this.fetchPlaylistBySpotifyId(spotifyPlaylistId!);
        } catch (error) {
          console.error('Failed to add track to playlist', error);
        }
      }
    });
  }
}
