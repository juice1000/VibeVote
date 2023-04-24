import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AddTrackComponent } from '../add-track/add-track.component';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
})
export class PlaylistComponent implements OnInit {
  playlist: any;
  userVotes: boolean[] = [];
  addTrackVisible = false;

  @ViewChild(AddTrackComponent) addTrackComponent!: AddTrackComponent;

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService
  ) {}

  async ngOnInit(): Promise<void> {
    const spotifyPlaylistId: any =
      this.route.snapshot.paramMap.get('spotifyPlaylistId');

    try {
      this.playlist = await this.playlistService.getPlaylistBySpotifyId(
        spotifyPlaylistId,
        false
      );
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  }

  async fetchPlaylistBySpotifyId(spotifyPlaylistId: string): Promise<void> {
    try {
      this.playlist = await this.playlistService.getPlaylistBySpotifyId(
        spotifyPlaylistId,
        false
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
      const unplayedPlaylist = await this.playlistService.updatePlaylistOrder(
        spotifyPlaylistId!
      );
      console.log('this.playlist in vote', this.playlist);
      console.log('unplayedPlaylist in vote', unplayedPlaylist);

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
    //   const spotifyPlaylistId =
    //     this.route.snapshot.paramMap.get('spotifyPlaylistId');
    //   const dialogRef = this.dialog.open(AddTrackComponent, {
    //     data: { spotifyPlaylistId },
    //   });
    //   const addTrackBtn = document.querySelector('.add-track-btn');
    //   if (addTrackBtn) {
    //     addTrackBtn.setAttribute('disabled', 'true');
    //   }

    //   dialogRef.afterClosed().subscribe(async (result) => {
    //     if (addTrackBtn) {
    //       addTrackBtn.removeAttribute('disabled');
    //     }

    //     if (result) {
    //       try {
    //         await this.playlistService.addTrackToPlaylist(
    //           spotifyPlaylistId!,
    //           result
    //         );
    //         await this.playlistService.markTracksAsPlayed(spotifyPlaylistId!);
    //         this.playlist = await this.playlistService.updatePlaylistOrder(
    //           spotifyPlaylistId!
    //         );
    //         await this.fetchPlaylistBySpotifyId(spotifyPlaylistId!);
    //       } catch (error) {
    //         console.error('Failed to add track to playlist', error);
    //       }
    //     }
    //   });
    this.addTrackVisible = true;
  }

  async onAddTrackModalClose(result: string | null): Promise<void> {
    this.addTrackVisible = false;

    if (result) {
      const spotifyPlaylistId =
        this.route.snapshot.paramMap.get('spotifyPlaylistId');
      try {
        await this.playlistService.addTrackToPlaylist(
          spotifyPlaylistId!,
          result
        );
        await this.playlistService.markTracksAsPlayed(spotifyPlaylistId!);
        this.playlist = await this.playlistService.updatePlaylistOrder(
          spotifyPlaylistId!
        );
        await this.fetchPlaylistBySpotifyId(spotifyPlaylistId!);
      } catch (error) {
        console.error('Failed to add track to playlist', error);
      }
    }
  }
}
